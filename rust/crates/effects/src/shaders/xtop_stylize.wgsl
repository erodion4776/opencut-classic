struct VertexOutput {
 @builtin(position) position: vec4f,
 @location(0) tex_coord: vec2f,
}

struct EffectUniforms {
 resolution: vec2f,
 direction: vec2f,
 scalars: vec4f,
}

@group(0) @binding(0) var input_texture: texture_2d<f32>;
@group(0) @binding(1) var input_sampler: sampler;
@group(1) @binding(0) var<uniform> uniforms: EffectUniforms;

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
 let source = textureSample(input_texture, input_sampler, input.tex_coord);
 let amount = clamp(uniforms.scalars.x, 0.0, 1.0);
 let mode = uniforms.scalars.y;
 var rgb = source.rgb;

 if (mode < 0.5) {
  let sepia = vec3f(
   dot(source.rgb, vec3f(0.393, 0.769, 0.189)),
   dot(source.rgb, vec3f(0.349, 0.686, 0.168)),
   dot(source.rgb, vec3f(0.272, 0.534, 0.131))
  );
  rgb = mix(source.rgb, sepia, amount);
 } else if (mode < 1.5) {
  let luma = dot(source.rgb, vec3f(0.2126, 0.7152, 0.0722));
  rgb = mix(source.rgb, vec3f(luma), amount);
 } else {
  let centered = (input.tex_coord - vec2f(0.5)) * vec2f(uniforms.resolution.x / uniforms.resolution.y, 1.0);
  let radius = length(centered);
  let edge = smoothstep(0.25, 0.78, radius);
  let factor = 1.0 - amount * edge;
  rgb = source.rgb * factor;
 }

 return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), source.a);
}
