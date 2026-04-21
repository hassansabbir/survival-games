import * as PIXI from 'pixi.js';

const fragmentShader = `#version 300 es
precision highp float;

in vec2 vUV;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCameraOffset;

void main(void) {
    vec2 uv = vUV;
    vec2 worldPos = uv * uResolution + uCameraOffset;
    
    // Simpler animation to ensure it works
    float distortion = sin(worldPos.x * 0.05 + uTime) * 0.002;
    vec2 targetUv = uv + vec2(distortion, 0.0);
    
    outColor = texture(uTexture, targetUv);
}
`;

export class GrassBackground extends PIXI.TilingSprite {
  private grassShader: PIXI.Filter;

  constructor(texture: PIXI.Texture, width: number, height: number) {
    super({
        texture,
        width,
        height
    });
    
    this.grassShader = new PIXI.Filter({
        gl: {
            fragment: fragmentShader
        },
        resources: {
            grassUniforms: new PIXI.UniformGroup({
                uTime: { value: 0, type: 'f32' },
                uResolution: { value: new Float32Array([width, height]), type: 'vec2<f32>' },
                uCameraOffset: { value: new Float32Array([0, 0]), type: 'vec2<f32>' }
            })
        }
    });

    this.filters = [this.grassShader];
  }

  update(_dt: number, time: number, _playerPos: { x: number, y: number }, camera: { x: number, y: number }) {
    const uniforms = (this.grassShader.resources.grassUniforms as PIXI.UniformGroup).uniforms;
    uniforms.uTime = time;
    uniforms.uCameraOffset[0] = camera.x;
    uniforms.uCameraOffset[1] = camera.y;
    
    this.tilePosition.x = -camera.x;
    this.tilePosition.y = -camera.y;
  }
}
