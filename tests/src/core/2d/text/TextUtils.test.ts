import { WebGLEngine } from "@galacean/engine-rhi-webgl";
import { TextUtils, TextRenderer, Entity, Scene, Camera, Font, FontStyle, OverflowMode } from "@galacean/engine-core";
import { Vector3 } from "@galacean/engine-math";
import { expect } from "chai";

describe("TextUtils", () => {
  let engine: WebGLEngine;
  let scene: Scene;
  let textEntity1: Entity;
  let textEntity2: Entity;
  let textRendererTruncate: TextRenderer;
  let textRendererOverflow: TextRenderer;

  before(async () => {
    engine = await WebGLEngine.create({
      canvas: document.createElement("canvas")
    });
    engine.canvas.resizeByClientSize();

    // Create root entity.
    scene = engine.sceneManager.activeScene;
    scene.createRootEntity("root");

    const rootEntity = scene.getRootEntity();
    const cameraEntity = rootEntity.createChild("Camera");
    cameraEntity.addComponent(Camera);
    cameraEntity.transform.setPosition(0, 0, 10);
    cameraEntity.transform.lookAt(new Vector3(0, 0, 0));

    textEntity1 = rootEntity.createChild("text1");
    textEntity2 = rootEntity.createChild("text2");

    textRendererTruncate = textEntity1.addComponent(TextRenderer);
    textRendererTruncate.font = Font.createFromOS(engine, "Arial");

    textRendererOverflow = textEntity2.addComponent(TextRenderer);
    textRendererOverflow.font = Font.createFromOS(engine, "Arial");

    engine.run();
  });

  it("measureFont", () => {
    // Test that _measureFontOrChar works correctly.
    const result1 = TextUtils.measureFont("");
    const result2 = TextUtils.measureFont("20px Arial");
    const result3 = TextUtils.measureFont("20px Arial Black");

    // Test that return same object, while repeat call measureFont.
    expect(TextUtils.measureFont("")).to.be.equal(result1);
    expect(TextUtils.measureFont("20px Arial")).to.be.equal(result2);
    expect(TextUtils.measureFont("20px Arial Black")).to.be.equal(result3);
  });

  it("measureChar", async () => {
    let result1: TextUtils.CharInfo;
    let result2: TextUtils.CharInfo;

    let char = "a";
    expect(() => {
      // If fontString is undefined or null or empty string, measureChar will not throw error,
      // and results are random.
      TextUtils.measureChar(char, undefined);
      TextUtils.measureChar(char, null);
      TextUtils.measureChar(char, "");

      // If char is not a single character, measureChar still works, and width will be string's width.
      TextUtils.measureChar("haha", "20px Arial");
    }).not.to.throw();

    // Test that measureChar returns correct result.
    result1 = TextUtils.measureChar(char, "20px Arial");
    result2 = TextUtils.measureChar(char, "20px Arial");
    expect(result1).to.be.deep.equal(result2);

    char = "A";
    result1 = TextUtils.measureChar(char, "20px Arial");
    result2 = TextUtils.measureChar(char, "20px Arial");
    expect(result1).to.be.deep.equal(result2);

    char = "😭";
    result1 = TextUtils.measureChar(char, "20px Arial");
    result2 = TextUtils.measureChar(char, "20px Arial");
    expect(result1).to.be.deep.equal(result2);

    char = "孒";
    result1 = TextUtils.measureChar(char, "20px Arial");
    result2 = TextUtils.measureChar(char, "20px Arial");
    expect(result1).to.be.deep.equal(result2);

    char = "";
    result1 = TextUtils.measureChar(char, "20px Arial");
    result2 = TextUtils.measureChar(char, "20px Arial");
    expect(result1).to.be.deep.equal(result2);

    char = undefined;
    result1 = TextUtils.measureChar(char, "20px Arial");
    result2 = TextUtils.measureChar(char, "20px Arial");
    expect(result1).to.be.deep.equal(result2);
  });

  // Prepare different text variables for tests.
  const text1 = "趚今天天气很好，阳光明媚。我 在公园里 漫步。";
  const text2 = "The weather is great today.";
  const text3 = "阳光明媚，the weather is great today。";
  const text4 = "         \n       World";

  it("measureTextWithWrap", () => {
    textRendererTruncate.overflowMode = OverflowMode.Truncate;
    textRendererTruncate.fontSize = 24;
    textRendererTruncate.width = 0.24;
    textRendererTruncate.height = 1;
    textRendererTruncate.enableWrapping = true;

    // Test that measureTextWithWrap works correctly, while set overflow mode to truncate.
    textRendererTruncate.text = "";
    let result = TextUtils.measureTextWithWrap(textRendererTruncate);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal([""]);
    expect(result.lineWidths).to.be.deep.equal([0]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererTruncate.text = undefined;
    result = TextUtils.measureTextWithWrap(textRendererTruncate);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal([""]);
    expect(result.lineWidths).to.be.deep.equal([0]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererTruncate.text = text1;
    result = TextUtils.measureTextWithWrap(textRendererTruncate);
    expect(result.width).to.be.equal(24);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["趚", "今", "天", "天", "气", "很", "好", "，", "阳", "光", "明", "媚", "。", "我", "在", "公", "园", "里", "漫", "步", "。"]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererTruncate.text = text2;
    result = TextUtils.measureTextWithWrap(textRendererTruncate);
    expect(result.width).to.be.equal(24);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["T", "h", "e ", "w", "e", "at", "h", "er", "is ", "gr", "e", "at", "to", "d", "a", "y."]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererTruncate.text = text3;
    result = TextUtils.measureTextWithWrap(textRendererTruncate);
    expect(result.width).to.be.equal(24);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["阳", "光", "明", "媚", "，", "th", "e ", "w", "e", "at", "h", "er", "is ", "gr", "e", "at", "to", "d", "a", "y", "。"]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererTruncate.text = text4;
    result = TextUtils.measureTextWithWrap(textRendererTruncate);
    expect(result.width).to.be.equal(23);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["   ", "   ", "W", "or", "ld"]);
    expect(result.lineHeight).to.be.equal(27);

    // Test that measureTextWithWrap works correctly, while set overflow mode to overflow.
    textRendererOverflow.overflowMode = OverflowMode.Overflow;
    textRendererOverflow.fontSize = 24;
    textRendererOverflow.width = 0.2;
    textRendererOverflow.height = 1;
    textRendererOverflow.enableWrapping = true;

    textRendererOverflow.text = "";
    result = TextUtils.measureTextWithWrap(textRendererOverflow);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(27);
    expect(result.lines).to.be.deep.equal([""]);
    expect(result.lineWidths).to.be.deep.equal([0]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererOverflow.text = undefined;
    result = TextUtils.measureTextWithWrap(textRendererOverflow);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(27);
    expect(result.lines).to.be.deep.equal([""]);
    expect(result.lineWidths).to.be.deep.equal([0]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererOverflow.text = text1;
    result = TextUtils.measureTextWithWrap(textRendererOverflow);
    expect(result.width).to.be.equal(24);
    expect(result.height).to.be.equal(567);
    expect(result.lines).to.be.deep.equal(["趚", "今", "天", "天", "气", "很", "好", "，", "阳", "光", "明", "媚", "。", "我", "在", "公", "园", "里", "漫", "步", "。"]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererOverflow.text = text2;
    result = TextUtils.measureTextWithWrap(textRendererOverflow);
    expect(result.width).to.be.equal(20);
    expect(result.height).to.be.equal(486);
    expect(result.lines).to.be.deep.equal(["T", "h", "e ", "w", "e", "at", "h", "e", "r ", "is", "g", "r", "e", "at", "to", "d", "a", "y."]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererOverflow.text = text3;
    result = TextUtils.measureTextWithWrap(textRendererOverflow);
    expect(result.width).to.be.equal(24);
    expect(result.height).to.be.equal(621);
    expect(result.lines).to.be.deep.equal(["阳", "光", "明", "媚", "，", "th", "e ", "w", "e", "at", "h", "e", "r ", "is", "g", "r", "e", "at", "to", "d", "a", "y", "。"]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererOverflow.text = text4;
    result = TextUtils.measureTextWithWrap(textRendererOverflow);
    expect(result.width).to.be.equal(23);
    expect(result.height).to.be.equal(162);
    expect(result.lines).to.be.deep.equal(["  ", "  ", "W", "o", "rl", "d"]);
    expect(result.lineHeight).to.be.equal(27);
  });

  it("measureTextWithoutWrap", () => {
    textRendererTruncate.overflowMode = OverflowMode.Truncate;
    textRendererTruncate.fontSize = 24;
    textRendererTruncate.width = 0.24;
    textRendererTruncate.height = 1;
    textRendererTruncate.enableWrapping = true;

    // Test that measureTextWithoutWrap works correctly, while set overflow mode to truncate.
    textRendererTruncate.text = "";
    let result = TextUtils.measureTextWithoutWrap(textRendererTruncate);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal([]);
    expect(result.lineWidths).to.be.deep.equal([]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererTruncate.text = undefined;
    result = TextUtils.measureTextWithoutWrap(textRendererTruncate);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal([]);
    expect(result.lineWidths).to.be.deep.equal([]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererTruncate.text = text1;
    result = TextUtils.measureTextWithoutWrap(textRendererTruncate);
    expect(result.width).to.be.equal(518);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["趚今天天气很好，阳光明媚。我 在公园里 漫步。"]);
    expect(result.lineWidths).to.be.deep.equal([518]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererTruncate.text = text2;
    result = TextUtils.measureTextWithoutWrap(textRendererTruncate);
    expect(result.width).to.be.equal(289);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["The weather is great today."]);
    expect(result.lineWidths).to.be.deep.equal([289]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererTruncate.text = text3;
    result = TextUtils.measureTextWithoutWrap(textRendererTruncate);
    expect(result.width).to.be.equal(418);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["阳光明媚，the weather is great today。"]);
    expect(result.lineWidths).to.be.deep.equal([418]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererTruncate.text = text4;
    result = TextUtils.measureTextWithoutWrap(textRendererTruncate);
    expect(result.width).to.be.equal(111);
    expect(result.height).to.be.equal(100);
    expect(result.lines).to.be.deep.equal(["         ", "       World"]);
    expect(result.lineWidths).to.be.deep.equal([63, 111]);
    expect(result.lineHeight).to.be.equal(27);

    // Test that measureTextWithoutWrap works correctly, while set overflow mode to overflow.
    textRendererOverflow.overflowMode = OverflowMode.Overflow;
    textRendererOverflow.fontSize = 24;
    textRendererOverflow.width = 0.2;
    textRendererOverflow.height = 1;
    textRendererOverflow.enableWrapping = true;

    textRendererOverflow.text = "";
    result = TextUtils.measureTextWithoutWrap(textRendererOverflow);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(0);
    expect(result.lines).to.be.deep.equal([]);
    expect(result.lineWidths).to.be.deep.equal([]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererOverflow.text = undefined;
    result = TextUtils.measureTextWithoutWrap(textRendererOverflow);
    expect(result.width).to.be.equal(0);
    expect(result.height).to.be.equal(0);
    expect(result.lines).to.be.deep.equal([]);
    expect(result.lineWidths).to.be.deep.equal([]);
    expect(result.lineHeight).to.be.deep.equal(27);

    textRendererOverflow.text = text1;
    result = TextUtils.measureTextWithoutWrap(textRendererOverflow);
    expect(result.width).to.be.equal(518);
    expect(result.height).to.be.equal(27);
    expect(result.lines).to.be.deep.equal(["趚今天天气很好，阳光明媚。我 在公园里 漫步。"]);
    expect(result.lineWidths).to.be.deep.equal([518]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererOverflow.text = text2;
    result = TextUtils.measureTextWithoutWrap(textRendererOverflow);
    expect(result.width).to.be.equal(289);
    expect(result.height).to.be.equal(27);
    expect(result.lines).to.be.deep.equal(["The weather is great today."]);
    expect(result.lineWidths).to.be.deep.equal([289]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererOverflow.text = text3;
    result = TextUtils.measureTextWithoutWrap(textRendererOverflow);
    expect(result.width).to.be.equal(418);
    expect(result.height).to.be.equal(27);
    expect(result.lines).to.be.deep.equal(["阳光明媚，the weather is great today。"]);
    expect(result.lineWidths).to.be.deep.equal([418]);
    expect(result.lineHeight).to.be.equal(27);
    textRendererOverflow.text = text4;
    result = TextUtils.measureTextWithoutWrap(textRendererOverflow);
    expect(result.width).to.be.equal(111);
    expect(result.height).to.be.equal(54);
    expect(result.lines).to.be.deep.equal(["         ", "       World"]);
    expect(result.lineWidths).to.be.deep.equal([63, 111]);
    expect(result.lineHeight).to.be.equal(27);
  });

  it("getNativeFontHash", () => {
    // Test that getNativeFontHash works correctly.
    expect(TextUtils.getNativeFontHash("Arial", 12, FontStyle.None)).to.be.equal("12pxArial");
    expect(TextUtils.getNativeFontHash("Arial Black", 12, FontStyle.None)).to.be.equal("12pxArial Black");
    expect(TextUtils.getNativeFontHash("Arial Black", 13, FontStyle.Bold)).to.be.equal("bold13pxArial Black");
    expect(TextUtils.getNativeFontHash("Arial Black", 13, FontStyle.Italic)).to.be.equal("italic13pxArial Black");
    expect(TextUtils.getNativeFontHash('"Arial Black"', 13, FontStyle.Italic | FontStyle.Bold)).to.be.equal(
      'bolditalic13px"Arial Black"'
    );
    expect(TextUtils.getNativeFontHash("serif", 13, FontStyle.Italic | FontStyle.Bold)).to.be.equal(
      "bolditalic13pxserif"
    );
    expect(TextUtils.getNativeFontHash('"serif"', 13, FontStyle.Italic | FontStyle.Bold)).to.be.equal(
      'bolditalic13px"serif"'
    );
  });

  it("getNativeFontString", () => {
    // Test that getNativeFontString works correctly.
    expect(TextUtils.getNativeFontString("Arial", 12, FontStyle.None)).to.be.equal('12px "Arial"');
    expect(TextUtils.getNativeFontString("Arial Black", 12, FontStyle.None)).to.be.equal('12px "Arial Black"');
    expect(TextUtils.getNativeFontString("Arial Black", 13, FontStyle.Bold)).to.be.equal('bold 13px "Arial Black"');
    expect(TextUtils.getNativeFontString("Arial Black", 13, FontStyle.Italic)).to.be.equal('italic 13px "Arial Black"');
    expect(TextUtils.getNativeFontString("Arial Black", 13, FontStyle.Italic | FontStyle.Bold)).to.be.equal(
      'bold italic 13px "Arial Black"'
    );
    expect(TextUtils.getNativeFontString('"Arial Black"', 13, FontStyle.Italic | FontStyle.Bold)).to.be.equal(
      'bold italic 13px "Arial Black"'
    );
    expect(TextUtils.getNativeFontString('"serif"', 13, FontStyle.Italic | FontStyle.Bold)).to.be.equal(
      'bold italic 13px "serif"'
    );
  });

  after(() => {
    engine.destroy();
  });
});
