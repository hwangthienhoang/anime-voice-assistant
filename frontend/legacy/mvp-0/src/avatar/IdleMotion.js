// Chuyển động thân người (idle + cử chỉ khi nói) cho model VRM.
//
// Thay vì một sóng sin đơn lẻ trên vài xương, mỗi bộ phận chuyển động theo tổ hợp
// nhiều sóng lệch pha ("noise" mượt, không lặp rõ ràng) và các xương liên kết với nhau như
// người thật: hông chuyển trọng tâm -> cột sống/cổ/đầu bù ngược lại -> chân trụ duỗi,
// chân kia chùng gối; thở kéo theo ngực và vai; đầu nhìn theo chậm hơn mắt; khi nói thì
// gật đầu, nhấn nhá và tay đưa nhẹ theo nhịp giọng.
//
// Quy ước góc dưới đây theo VRM 1.0 (mặt hướng +z, trái nhân vật ở +x). Model VRM 0.x
// được three-vrm giữ nguyên hệ trục cũ (xoay 180° quanh y) nên trục x và z phải đảo dấu;
// việc đó gói gọn trong `_rot`.

import * as THREE from 'three';

const TAU = Math.PI * 2;

/** Nhiễu mượt giả ngẫu nhiên trong khoảng ~[-1, 1] (tổng 3 sóng có tần số vô tỉ). */
function noise(t, seed = 0) {
  return (
    Math.sin(t + seed * 12.9898) * 0.5 +
    Math.sin(t * 2.31 + seed * 78.233 + 1.7) * 0.3 +
    Math.sin(t * 4.13 + seed * 37.719 + 4.2) * 0.2
  );
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Biên độ (radian; dịch chuyển tính theo tỉ lệ thân) — chỉnh ở đây nếu thấy quá/thiếu.
const AMP = {
  armDown: 1.15, // góc hạ tay khỏi tư thế chữ T
  elbowBend: 0.2, // khuỷu tay gập nhẹ khi đứng nghỉ
  weightShift: 1, // nhân hệ số chuyển trọng tâm (0 = tắt)
  breath: 1, // nhân hệ số thở
  gesture: 1, // nhân hệ số cử chỉ khi nói
};

export class IdleMotion {
  /**
   * @param {import('@pixiv/three-vrm').VRM} vrm
   * @param {{scale?: number}} opts scale = chiều cao hông→đầu (m), để dịch chuyển tỉ lệ theo cỡ model
   */
  constructor(vrm, opts = {}) {
    this.vrm = vrm;
    this.scale = opts.scale ?? 0.5;
    this.f = vrm.meta?.metaVersion === '0' ? -1 : 1;

    this.hips = this._bone('hips');
    this.hipsBase = this.hips ? this.hips.position.clone() : null;

    this.headYaw = 0;
    this.headPitch = 0;
    this.talk = 0; // 0..1: đang nói hay không (làm mượt)
    this.mouthSlow = 0;
    this.emph = 0; // xung nhấn nhá khi âm lượng tăng đột ngột
    this.time = Math.random() * 100; // lệch pha khởi đầu để lần nào tải cũng khác nhau

    this.animated = new Set(); // xương đang được clip VRMA điều khiển (chế độ overlay)
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
  }

  /** Khai báo các xương mà clip VRMA đang ghi mỗi khung hình (để overlay biết cộng thêm hay tự đặt). */
  setAnimatedBones(names) {
    this.animated = new Set(names);
  }

  /**
   * Chế độ overlay khi đã có animation VRMA lo phần thân. Với xương KHÔNG được clip nào điều
   * khiển, ta tự đặt hướng nhìn (đầu/cổ) vào đó. Với xương ĐANG được clip điều khiển (mọi bộ
   * clip hiện tại đều có track đầu/cổ), ta CHỦ ĐỘNG không đụng vào nữa — xem lý do dưới đây —
   * và để phần "mắt liếc theo con trỏ" cho hệ lookAt chính thức của VRM lo (mắt vẫn theo chuột
   * bình thường, chỉ là đầu không tự nghiêng thêm nữa trong lúc có animation chạy).
   *
   * Lý do bỏ: bản trước cộng thêm một góc nhỏ bằng `quaternion.multiply()` ngay trên xương mà
   * AnimationMixer đang ghi mỗi khung hình. Việc này giả định mixer luôn ghi đè HOÀN TOÀN xương
   * đó trước khi ta multiply — nhưng đã đo thực tế và thấy không phải lúc nào cũng vậy (mixer có
   * tối ưu nội bộ, có khung hình không ghi lại nếu "không có gì thay đổi"), nên góc nhỏ đó cộng
   * dồn qua nhiều khung hình và biến thành đầu xoay vòng rất nhanh. Tắt hẳn phép multiply này đã
   * xác nhận hết xoay hoàn toàn; bật lại là tái hiện y hệt lỗi — nên xoá bỏ, không giảm nhẹ.
   * Gọi SAU khi mixer.update và TRƯỚC vrm.update.
   */
  updateOverlay(dt, { gazeX, gazeY }) {
    const k = 1 - Math.exp(-dt * 2.4);
    this.headYaw += (gazeX * 0.4 - this.headYaw) * k;
    this.headPitch += (-gazeY * 0.22 - this.headPitch) * k;
    this._offset('neck', this.headPitch * 0.4, this.headYaw * 0.4);
    this._offset('head', this.headPitch * 0.6, this.headYaw * 0.6);
  }

  _offset(name, x, y) {
    const n = this._bone(name);
    if (!n) return;
    if (this.animated.has(n.name)) return; // clip đang lo xương này — không đụng vào
    this._q.setFromEuler(this._e.set(x * this.f, y, 0));
    n.quaternion.copy(this._q); // luôn gán TUYỆT ĐỐI (không multiply/cộng dồn)
  }

  _bone(name) {
    return this.vrm.humanoid?.getNormalizedBoneNode(name) ?? null;
  }

  _rot(name, x = 0, y = 0, z = 0) {
    const n = this._bone(name);
    if (n) n.rotation.set(x * this.f, y, z * this.f);
  }

  /**
   * @param {number} dt giây
   * @param {{gazeX:number, gazeY:number, mouth:number}} input gaze: -1..1 (âm = trái/xuống), mouth: 0..1
   */
  update(dt, input) {
    this.time += dt;
    const t = this.time;
    const k = (s) => 1 - Math.exp(-dt * s); // hệ số làm mượt không phụ thuộc fps
    const { gazeX, gazeY, mouth } = input;

    // ---- trạng thái nói ----
    const speaking = mouth > 0.06;
    this.talk += ((speaking ? 1 : 0) - this.talk) * k(speaking ? 5 : 1.2);
    const rise = Math.max(0, mouth - this.mouthSlow);
    this.mouthSlow += (mouth - this.mouthSlow) * k(3.5);
    this.emph += (clamp(rise * 3, 0, 1) - this.emph) * k(9);
    const talk = this.talk * AMP.gesture;
    const emph = this.emph;

    // ---- nhịp thở (chu kỳ ~4.2s) và chuyển trọng tâm (chậm, không đều) ----
    const br = Math.sin((t * TAU) / 4.2) * AMP.breath;
    const w = clamp(noise(t * 0.3, 1) * 1.1, -1, 1) * AMP.weightShift; // -1: dồn sang phải, +1: sang trái
    const S = this.scale;

    // ---- đầu nhìn theo hướng chú ý, chậm hơn mắt và chia đều qua cột sống/cổ ----
    this.headYaw += (gazeX * 0.4 - this.headYaw) * k(2.4);
    this.headPitch += (-gazeY * 0.22 - this.headPitch) * k(2.4);
    const hy = this.headYaw;
    const hp = this.headPitch;

    // ---- hông ----
    if (this.hips) {
      const bend = Math.abs(w);
      this.hips.position.set(
        this.hipsBase.x + w * 0.02 * S * this.f,
        this.hipsBase.y - bend * 0.01 * S + br * 0.0025 * S,
        this.hipsBase.z
      );
    }
    const hipsRoll = w * 0.045;
    this._rot('hips', 0, noise(t * 0.22, 2) * 0.03 + hy * 0.06, hipsRoll);

    // ---- thân: bù ngược hông, thở, nhấn nhá khi nói ----
    const lean = 0.02 + emph * 0.03 * talk;
    this._rot('spine', lean * 0.5 + br * 0.006, hy * 0.15, -w * 0.035 + noise(t * 0.4, 3) * 0.006);
    const chestPitch = -br * 0.02 + emph * 0.02 * talk;
    if (this._bone('upperChest')) {
      this._rot('chest', chestPitch * 0.5, hy * 0.1, -w * 0.02);
      this._rot('upperChest', chestPitch * 0.5, hy * 0.1, -w * 0.02);
    } else {
      this._rot('chest', chestPitch, hy * 0.2, -w * 0.03);
    }

    // ---- cổ + đầu: nhìn theo, tự cân bằng ngược thân, vi chuyển động, gật khi nói ----
    this._rot('neck', hp * 0.4, hy * 0.3, w * 0.05);
    this._rot(
      'head',
      hp * 0.6 + noise(t * 0.7, 4) * 0.012 + talk * (noise(t * 3.1, 7) * 0.025 + emph * 0.07),
      hy * 0.35 + noise(t * 0.55, 5) * 0.02 + talk * noise(t * 2.3, 8) * 0.045,
      noise(t * 0.35, 6) * 0.03 + w * 0.02 + talk * noise(t * 1.9, 9) * 0.03
    );

    // ---- vai nhấp nhô theo hơi thở ----
    const shoulder = br * 0.018 + noise(t * 0.5, 10) * 0.006;
    this._rot('leftShoulder', 0, 0, shoulder);
    this._rot('rightShoulder', 0, 0, -shoulder);

    // ---- tay: buông xuôi, đung đưa nhẹ theo trọng tâm; khi nói thì đưa tay lên một chút ----
    const gest = talk * (0.1 + 0.08 * noise(t * 1.3, 13));
    const bendBase = AMP.elbowBend + talk * (0.25 + 0.2 * noise(t * 1.7, 14) + emph * 0.2);
    const armL = AMP.armDown + w * 0.03 + noise(t * 0.4, 15) * 0.025 - gest;
    const armR = AMP.armDown - w * 0.03 + noise(t * 0.4, 16) * 0.025 - gest;
    const fwdL = noise(t * 0.35, 11) * 0.06 - talk * (0.12 + 0.08 * noise(t * 1.1, 17));
    const fwdR = noise(t * 0.35, 12) * 0.06 - talk * (0.12 + 0.08 * noise(t * 1.4, 18));
    this._rot('leftUpperArm', fwdL, 0, -armL);
    this._rot('rightUpperArm', fwdR, 0, armR);
    this._rot('leftLowerArm', 0, -(bendBase + noise(t * 0.6, 19) * 0.04), 0);
    this._rot('rightLowerArm', 0, bendBase + noise(t * 0.6, 20) * 0.04, 0);
    this._rot('leftHand', 0, 0, noise(t * 0.5, 21) * 0.05);
    this._rot('rightHand', 0, 0, noise(t * 0.5, 22) * 0.05);

    // ---- chân: chân trụ duỗi thẳng, chân còn lại chùng gối; bàn chân giữ phẳng ----
    const kneeL = Math.max(0, w) * 0.1 + 0.015;
    const kneeR = Math.max(0, -w) * 0.1 + 0.015;
    this._rot('leftUpperLeg', -kneeL * 0.5, 0, -hipsRoll);
    this._rot('rightUpperLeg', -kneeR * 0.5, 0, -hipsRoll);
    this._rot('leftLowerLeg', kneeL, 0, 0);
    this._rot('rightLowerLeg', kneeR, 0, 0);
    this._rot('leftFoot', -kneeL * 0.5, 0, 0);
    this._rot('rightFoot', -kneeR * 0.5, 0, 0);
  }
}

export { noise };
