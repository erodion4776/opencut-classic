struct VertexOutput {
 @builtin(position) position: vec4f,
 @location(0) tex_coord: vec2f,
}
struct EffectUniforms { resolution: vec2f, direction: vec2f, scalars: vec4f, }
@group(0) @binding(0) var input_texture: texture_2d<f32>;
@group(0) @binding(1) var input_sampler: sampler;
@group(1) @binding(0) var<uniform> uniforms: EffectUniforms;

fn hash21(p: vec2f) -> f32 {
 let h = dot(p, vec2f(127.1, 311.7));
 return fract(sin(h) * 43758.5453);
}

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
 let uv = input.tex_coord;
 let source = textureSample(input_texture, input_sampler, uv);
 let amount = clamp(uniforms.scalars.x, 0.0, 1.0);
 let mode = uniforms.scalars.y;
 var rgb = source.rgb;

 if (mode < 0.5) {
  let sepia = vec3f(dot(source.rgb, vec3f(0.393, 0.769, 0.189)), dot(source.rgb, vec3f(0.349, 0.686, 0.168)), dot(source.rgb, vec3f(0.272, 0.534, 0.131)));
  rgb = mix(source.rgb, sepia, amount);
 } else if (mode < 1.5) {
  let luma = dot(source.rgb, vec3f(0.2126, 0.7152, 0.0722));
  rgb = mix(source.rgb, vec3f(luma), amount);
 } else if (mode < 2.5) {
  let centered = (uv - vec2f(0.5)) * vec2f(uniforms.resolution.x / uniforms.resolution.y, 1.0);
  let edge = smoothstep(0.25, 0.78, length(centered));
  rgb = source.rgb * (1.0 - amount * edge);
 } else if (mode < 3.5) {
  let direction = normalize(uv - vec2f(0.5) + vec2f(0.00001));
  let offset = direction * amount * 7.0 / uniforms.resolution;
  let red = textureSample(input_texture, input_sampler, clamp(uv + offset, vec2f(0.0), vec2f(1.0))).r;
  let blue = textureSample(input_texture, input_sampler, clamp(uv - offset, vec2f(0.0), vec2f(1.0))).b;
  rgb = vec3f(red, source.g, blue);
 } else if (mode < 4.5) {
  let cell = floor(uv * uniforms.resolution);
  let noise = (hash21(cell) - 0.5) * amount * 0.28;
  rgb = source.rgb + vec3f(noise);
 } else if (mode < 5.5) {
  let band = floor(uv.y * 48.0);
  let active = step(0.82, hash21(vec2f(band, 13.0)));
  let shift = (hash21(vec2f(band, 7.0)) - 0.5) * amount * 0.12 * active;
  let shifted = textureSample(input_texture, input_sampler, clamp(uv + vec2f(shift, 0.0), vec2f(0.0), vec2f(1.0)));
  let split = textureSample(input_texture, input_sampler, clamp(uv + vec2f(shift + amount * 2.0 / uniforms.resolution.x, 0.0), vec2f(0.0), vec2f(1.0)));
  rgb = mix(source.rgb, vec3f(split.r, shifted.g, source.b), active * amount);
 } else {
  let centered = (uv - vec2f(0.08, 0.18)) * vec2f(uniforms.resolution.x / uniforms.resolution.y, 1.0);
  let glow = exp(-length(centered) * 5.5) * amount;
  let leak = vec3f(1.0, 0.43, 0.12) * glow;
  rgb = mix(source.rgb, source.rgb + leak, clamp(glow, 0.0, 0.85));
 }
 return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), source.a);
}
