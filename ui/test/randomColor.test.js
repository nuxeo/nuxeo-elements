/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { randomColor } from '../dataviz/randomColor.js';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const RGB_RE = /^rgb\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}\s*\)$/;
const RGBA_RE = /^rgba\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*[0-9.]+\s*\)$/;
const HSL_RE = /^hsl\(\s*\d{1,3}(?:\.\d+)?,\s*\d{1,3}(?:\.\d+)?%,\s*\d{1,3}(?:\.\d+)?%\s*\)$/;
const HSLA_RE = /^hsla\(\s*\d{1,3}(?:\.\d+)?,\s*\d{1,3}(?:\.\d+)?%,\s*\d{1,3}(?:\.\d+)?%,\s*[0-9.]+\s*\)$/;

suite('randomColor', () => {
  test('returns a hex color by default', () => {
    const color = randomColor();
    expect(color).to.match(HEX_RE);
  });

  test('returns the requested format', () => {
    expect(randomColor({ format: 'hex' })).to.match(HEX_RE);
    expect(randomColor({ format: 'rgb' })).to.match(RGB_RE);
    expect(randomColor({ format: 'rgba' })).to.match(RGBA_RE);
    expect(randomColor({ format: 'rgbArray' }))
      .to.be.an('array')
      .with.lengthOf(3);
    expect(randomColor({ format: 'hsl' })).to.match(HSL_RE);
    expect(randomColor({ format: 'hsla' })).to.match(HSLA_RE);
    expect(randomColor({ format: 'hslArray' }))
      .to.be.an('array')
      .with.lengthOf(3);
  });

  test('respects an explicit alpha value', () => {
    const result = randomColor({ format: 'rgba', alpha: 0.42 });
    expect(result).to.match(RGBA_RE);
    expect(result).to.contain('0.42');
  });

  test('count returns an array of the requested length', () => {
    expect(randomColor({ count: 5 }))
      .to.be.an('array')
      .with.lengthOf(5);
    expect(randomColor({ count: 1 }))
      .to.be.an('array')
      .with.lengthOf(1);
  });

  test('seed accepts both integer and string values without throwing', () => {
    expect(() => randomColor({ seed: 1 })).to.not.throw();
    expect(() => randomColor({ seed: 'cursor' })).to.not.throw();
    // Both should still return well-formed hex colors
    expect(randomColor({ seed: 99 })).to.match(HEX_RE);
    expect(randomColor({ seed: 'green' })).to.match(HEX_RE);
  });

  test('throws when an invalid seed is provided', () => {
    expect(() => randomColor({ seed: { x: 1 } })).to.throw(TypeError);
  });

  test('supports named hue values', () => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'monochrome'];
    colors.forEach((hue) => {
      const result = randomColor({ hue });
      expect(result).to.match(HEX_RE);
    });
  });

  test('supports luminosity options', () => {
    const opts = ['bright', 'light', 'dark', 'random'];
    opts.forEach((luminosity) => {
      const result = randomColor({ luminosity });
      expect(result).to.match(HEX_RE);
    });
  });

  test('falls back gracefully when given an unknown hue name', () => {
    expect(randomColor({ hue: 'nuclear-pink' })).to.match(HEX_RE);
  });

  test('returns the requested format inside a count batch', () => {
    const out = randomColor({ count: 3, format: 'rgb' });
    expect(out).to.have.lengthOf(3);
    out.forEach((color) => expect(color).to.match(RGB_RE));
  });

  test('accepts numeric hue ranges', () => {
    expect(randomColor({ hue: 200 })).to.match(HEX_RE);
    expect(randomColor({ hue: '#ff0000' })).to.match(HEX_RE);
  });
});
