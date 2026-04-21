import * as PIXI from 'pixi.js';

export type CharacterType = 'cat' | 'wolf' | 'boar' | 'fox' | 'bear';

export class CharacterVisual extends PIXI.Container {
  private sprite: PIXI.Sprite;
  private shadow: PIXI.Graphics;
  private time: number = 0;
  private type: CharacterType;
  
  constructor(type: CharacterType = 'cat') {
    super();
    this.type = type;
    
    // Shadow
    this.shadow = new PIXI.Graphics();
    this.shadow.ellipse(0, 0, 20, 8);
    this.shadow.fill({ color: 0x000000, alpha: 0.2 });
    this.shadow.y = 20;
    this.addChild(this.shadow);

    // Sprite
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.85); // Anchor near the feet
    this.addChild(this.sprite);

    this.setupTexture();
  }

  private setupTexture() {
    if (this.type === 'cat') {
      this.sprite.texture = PIXI.Assets.get('cat');
      this.sprite.scale.set(0.12); // Adjust scale for the large cat asset
    } else {
      const enemiesTexture = PIXI.Assets.get('enemies');
      const baseWidth = enemiesTexture.width;
      const baseHeight = enemiesTexture.height;
      const frameWidth = baseWidth / 2;
      const frameHeight = baseHeight / 2;

      let frameX = 0;
      let frameY = 0;

      switch (this.type) {
        case 'wolf': frameX = 0; frameY = 0; break;
        case 'boar': frameX = frameWidth; frameY = 0; break;
        case 'fox': frameX = 0; frameY = frameHeight; break;
        case 'bear': frameX = frameWidth; frameY = frameHeight; break;
      }

      // Create a cropped texture for this specific enemy
      this.sprite.texture = new PIXI.Texture({
        source: enemiesTexture.source,
        frame: new PIXI.Rectangle(frameX, frameY, frameWidth, frameHeight)
      });
      
      const config = this.getCharacterConfig();
      this.sprite.scale.set(config.spriteScale);
    }
  }

  private getCharacterConfig() {
    switch (this.type) {
      case 'cat':
        return { spriteScale: 0.12 };
      case 'wolf':
        return { spriteScale: 0.15 };
      case 'boar':
        return { spriteScale: 0.18 };
      case 'fox':
        return { spriteScale: 0.14 };
      case 'bear':
        return { spriteScale: 0.35 };
      default:
        return { spriteScale: 0.15 };
    }
  }

  update(dt: number, velocity: { x: number, y: number }) {
    this.time += dt;
    
    const isMoving = Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1;
    
    if (isMoving) {
        // Wobble/Bounce animation
        const bounce = Math.abs(Math.sin(this.time * 12)) * 8;
        const tilt = Math.sin(this.time * 12) * 0.1;
        
        this.sprite.y = -bounce;
        this.sprite.rotation = tilt;
        
        // Flip based on direction
        if (velocity.x < 0) this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
        else if (velocity.x > 0) this.sprite.scale.x = Math.abs(this.sprite.scale.x);
    } else {
        // Idle breathing
        const breathe = Math.sin(this.time * 3) * 0.02;
        this.sprite.scale.y = this.getCharacterConfig().spriteScale * (1 + breathe);
        this.sprite.y = 0;
        this.sprite.rotation = 0;
    }

    // Shadow follows the character but stays on ground
    const shadowScale = isMoving ? 1 - (Math.abs(this.sprite.y) * 0.01) : 1;
    this.shadow.scale.set(shadowScale);
  }
}
