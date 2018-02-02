class Vector4D {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static dot(vec1, vec2) {
    return vec1.x * vec2.x
      + vec1.y * vec2.y
      + vec1.z * vec2.z
      + vec1.w * vec2.w;
  }

  static cross(vec1, vec2, vec3) {
    return new Vector4D(
      vec1.y * (vec2.z * vec3.w - vec2.w * vec3.z)
        + vec1.z * (vec2.w * vec3.y - vec2.y * vec3.w)
        + vec1.w * (vec2.y * vec3.z - vec2.z * vec3.y),
      vec1.z * (vec2.w * vec3.x - vec2.x * vec3.w)
        + vec1.w * (vec2.x * vec3.z - vec2.z * vec3.x)
        + vec1.x * (vec2.z * vec3.w - vec2.w * vec3.z),
      vec1.w * (vec2.x * vec3.y - vec2.y * vec3.x)
        + vec1.x * (vec2.y * vec3.w - vec2.w * vec3.y)
        + vec1.y * (vec2.w * vec3.x - vec2.x * vec3.w),
      vec1.x * (vec2.y * vec3.z - vec2.z * vec3.y)
        + vec1.y * (vec2.z * vec3.x - vec2.x * vec3.z)
        + vec1.z * (vec2.x * vec3.y - vec2.y * vec3.x)
    );
  }

  norm() {
    return Math.sqrt(Vector4D.dot(this, this));
  }

  scale(s) {
    return new Vector4D(
      s * this.x,
      s * this.y,
      s * this.z,
      s * this.w
    );
  }

  normalize() {
    return this.scale(1.0 / this.norm());
  }

  isZero() {
    return this.norm() === 0.0;
  }

  add(vec) {
    return new Vector4D(
      this.x + vec.x,
      this.y + vec.y,
      this.z + vec.z,
      this.w + vec.w
    );
  }

  sub(vec) {
    return new Vector4D(
      this.x - vec.x,
      this.y - vec.y,
      this.z - vec.z,
      this.w - vec.w
    );
  }

  dot(vec) {
    return Vector4D.dot(this, vec);
  }
}
