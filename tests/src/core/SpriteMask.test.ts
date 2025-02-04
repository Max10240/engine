import { Sprite, SpriteMask, Texture2D, SpriteMaskLayer } from "@galacean/engine-core";
import { WebGLEngine } from "@galacean/engine-rhi-webgl";
import { expect } from "chai";
import { Vector2, Vector4, Rect, Vector3 } from "@galacean/engine-math";

describe("SpriteMask", async () => {
  const canvas = document.createElement("canvas");
  const engine = await WebGLEngine.create({ canvas: canvas });
  const scene = engine.sceneManager.activeScene;

  engine.run();

  beforeEach(() => {
    scene.createRootEntity("root");
  });

  it("Constructor", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);

    expect(spriteMask instanceof SpriteMask).to.eq(true);
    expect(spriteMask.sprite).to.eq(null);
    expect(spriteMask.flipX).to.eq(false);
    expect(spriteMask.flipY).to.eq(false);
  });

  it("get set sprite", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    const texture = new Texture2D(engine, 100, 100);
    const sprite = new Sprite(engine, texture);
    spriteMask.sprite = sprite;
    expect(spriteMask.sprite).to.eq(sprite);
    spriteMask.sprite = sprite;
    expect(spriteMask.sprite).to.eq(sprite);
    spriteMask.sprite = null;
    expect(spriteMask.sprite).to.eq(null);
  });

  it("get set size", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    expect(spriteMask.width).to.eq(0);
    expect(spriteMask.height).to.eq(0);

    const texture2d = new Texture2D(engine, 100, 200);
    const sprite = new Sprite(engine, texture2d);
    spriteMask.sprite = sprite;
    expect(spriteMask.width).to.eq(1);
    expect(spriteMask.height).to.eq(2);

    spriteMask.sprite = null;
    expect(spriteMask.width).to.eq(0);
    expect(spriteMask.height).to.eq(0);

    spriteMask.width = 10;
    spriteMask.height = 20;
    expect(spriteMask.width).to.eq(10);
    expect(spriteMask.height).to.eq(20);
  });

  it("get set alphaCutoff", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    spriteMask.alphaCutoff = 1.0;

    expect(spriteMask.alphaCutoff).to.eq(1.0);
  });

  it("get set flip", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    spriteMask.flipX = true;
    spriteMask.flipY = true;

    expect(spriteMask.flipY).to.eq(true);
    expect(spriteMask.flipY).to.eq(true);
  });

  it("get set maskLayer", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    spriteMask.influenceLayers = SpriteMaskLayer.Layer10;
    expect(spriteMask.influenceLayers).to.eq(SpriteMaskLayer.Layer10);
  });

  it("get spriteMask bounds", () => {
    const rootEntity = scene.getRootEntity();
    const texture2D = new Texture2D(engine, 200, 300);
    const sprite = new Sprite(engine, texture2D);
    const spriteMask = rootEntity.addComponent(SpriteMask);
    expect(Vector3.equals(spriteMask.bounds.min, new Vector3(0, 0, 0))).to.eq(true);
    expect(Vector3.equals(spriteMask.bounds.max, new Vector3(0, 0, 0))).to.eq(true);
    spriteMask.sprite = sprite;
    spriteMask.width = 4;
    spriteMask.height = 5;
    sprite.pivot = new Vector2(0.5, 0.5);
    expect(Vector3.equals(spriteMask.bounds.min, new Vector3(-2, -2.5, 0))).to.eq(true);
    expect(Vector3.equals(spriteMask.bounds.max, new Vector3(2, 2.5, 0))).to.eq(true);
    sprite.pivot = new Vector2(0, 0);
    expect(Vector3.equals(spriteMask.bounds.min, new Vector3(0, 0, 0))).to.eq(true);
    expect(Vector3.equals(spriteMask.bounds.max, new Vector3(4, 5, 0))).to.eq(true);
    sprite.pivot = new Vector2(1, 1);
    expect(Vector3.equals(spriteMask.bounds.min, new Vector3(-4, -5, 0))).to.eq(true);
    expect(Vector3.equals(spriteMask.bounds.max, new Vector3(0, 0, 0))).to.eq(true);
  });

  it("DirtyFlag", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    const texture2d = new Texture2D(engine, 100, 200);
    const sprite = new Sprite(engine);
    spriteMask.sprite = sprite;
    // @ts-ignore
    const property = SpriteMask._textureProperty;
    expect(spriteMask.shaderData.getTexture(property)).to.eq(null);
    sprite.texture = texture2d;
    expect(spriteMask.shaderData.getTexture(property)).to.eq(texture2d);

    // @ts-ignore
    spriteMask._dirtyUpdateFlag &= ~0x5;
    sprite.width = 10;
    // @ts-ignore
    expect(!!(spriteMask._dirtyUpdateFlag & 0x5)).to.eq(true);

    // @ts-ignore
    spriteMask._dirtyUpdateFlag &= ~0x3;
    sprite.region = new Rect();
    // @ts-ignore
    expect(!!(spriteMask._dirtyUpdateFlag & 0x3)).to.eq(true);

    // @ts-ignore
    spriteMask._dirtyUpdateFlag &= ~0x3;
    sprite.atlasRegionOffset = new Vector4();
    // @ts-ignore
    expect(!!(spriteMask._dirtyUpdateFlag & 0x3)).to.eq(true);

    // @ts-ignore
    spriteMask._dirtyUpdateFlag &= ~0x2;
    sprite.atlasRegion = new Rect();
    // @ts-ignore
    expect(!!(spriteMask._dirtyUpdateFlag & 0x2)).to.eq(true);

    // @ts-ignore
    spriteMask._dirtyUpdateFlag &= ~0x1;
    sprite.pivot = new Vector2(0.3, 0.2);
    // @ts-ignore
    expect(!!(spriteMask._dirtyUpdateFlag & 0x1)).to.eq(true);
  });

  it("clone", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    const texture2d = new Texture2D(engine, 100, 200);
    const sprite = new Sprite(engine, texture2d);
    spriteMask.sprite = sprite;

    const rootEntityClone = rootEntity.clone();
    const spriteMaskClone = rootEntityClone.getComponent(SpriteMask);
    expect(spriteMaskClone.sprite).to.deep.eq(spriteMask.sprite);
  });

  it("destroy", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    spriteMask.sprite = new Sprite(engine, new Texture2D(engine, 100, 200));
    spriteMask.destroy();
    expect(spriteMask.sprite).to.eq(null);
    // @ts-ignore
    expect(spriteMask._verticesData).to.eq(null);
  });

  it("_render", () => {
    const rootEntity = scene.getRootEntity();
    const spriteMask = rootEntity.addComponent(SpriteMask);
    const texture2d = new Texture2D(engine, 100, 200);
    const context = { camera: { _renderPipeline: { _allSpriteMasks: { add: () => {} } } } };
    // @ts-ignore
    spriteMask._render(context);
    // @ts-ignore
    let { positions, uvs } = spriteMask._verticesData;
    expect(positions[0]).to.deep.eq(new Vector3(0, 0, 0));
    expect(positions[1]).to.deep.eq(new Vector3(0, 0, 0));
    expect(positions[2]).to.deep.eq(new Vector3(0, 0, 0));
    expect(positions[3]).to.deep.eq(new Vector3(0, 0, 0));

    expect(uvs[0]).to.deep.eq(new Vector2(0, 0));
    expect(uvs[1]).to.deep.eq(new Vector2(0, 0));
    expect(uvs[2]).to.deep.eq(new Vector2(0, 0));
    expect(uvs[3]).to.deep.eq(new Vector2(0, 0));
    // @ts-ignore
    const { min, max } = spriteMask._bounds;
    expect(min).to.deep.eq(new Vector3(0, 0, 0));
    expect(max).to.deep.eq(new Vector3(0, 0, 0));

    const sprite = new Sprite(engine, texture2d);
    spriteMask.sprite = sprite;
    // @ts-ignore
    spriteMask._render(context);
    // @ts-ignore
    expect(positions[0]).to.deep.eq(new Vector3(-0.5, -1, 0));
    expect(positions[1]).to.deep.eq(new Vector3(0.5, -1, 0));
    expect(positions[2]).to.deep.eq(new Vector3(-0.5, 1, 0));
    expect(positions[3]).to.deep.eq(new Vector3(0.5, 1, 0));
    expect(uvs[0]).to.deep.eq(new Vector2(0, 1));
    expect(uvs[1]).to.deep.eq(new Vector2(1, 1));
    expect(uvs[2]).to.deep.eq(new Vector2(0, 0));
    expect(uvs[3]).to.deep.eq(new Vector2(1, 0));
    // @ts-ignore
    expect(min).to.deep.eq(new Vector3(-0.5, -1, 0));
    expect(max).to.deep.eq(new Vector3(0.5, 1, 0));
  });
});
