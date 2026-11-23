import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { amplitudeToDecibels, decibelsToAmplitude } from '../src/lib/audio/decibel-scale';

describe('amplitudeToDecibels', () => {
  it('1. Amplitude 1.0 returns 0 dB', () => {
    assert.equal(amplitudeToDecibels(1.0), 0);
  });

  it('2. Amplitude 0.5 returns -6 dB', () => {
    assert.equal(amplitudeToDecibels(0.5), -6);
  });

  it('3. Amplitude 0.1 returns -20 dB', () => {
    assert.equal(amplitudeToDecibels(0.1), -20);
  });

  it('4. Amplitude 0 returns -60 dB', () => {
    assert.equal(amplitudeToDecibels(0), -60);
    assert.equal(amplitudeToDecibels(0, -80), -80);
  });

  it('5. Negative amplitude throws RangeError', () => {
    assert.throws(() => amplitudeToDecibels(-0.1), RangeError);
    assert.throws(() => amplitudeToDecibels(-1), RangeError);
  });

  it('6. Invalid input throws TypeError', () => {
    const convert = amplitudeToDecibels as (value: unknown) => number;
    for (const value of ['0.5', null, undefined, NaN, {}, []]) {
      assert.throws(() => convert(value), TypeError);
    }
  });

  it('clamps amplitude above 1 to 0 dB and below noise floor to minDecibels', () => {
    assert.equal(amplitudeToDecibels(1.5), 0);
    assert.equal(amplitudeToDecibels(Infinity), 0);
    assert.equal(amplitudeToDecibels(0.0001), -60);
  });

  it('rounds result to 1 decimal place', () => {
    assert.equal(amplitudeToDecibels(0.333), -9.6);
  });
});

describe('decibelsToAmplitude', () => {
  it('7. Decibels to amplitude conversion works correctly', () => {
    assert.equal(decibelsToAmplitude(0), 1);
    assert.equal(decibelsToAmplitude(-6), 0.5012);
    assert.equal(decibelsToAmplitude(-20), 0.1);
  });

  it('8. Values below the minimum decibel threshold return 0', () => {
    assert.equal(decibelsToAmplitude(-60), 0);
    assert.equal(decibelsToAmplitude(-70), 0);
    assert.equal(decibelsToAmplitude(-80, -80), 0);
    assert.equal(decibelsToAmplitude(-100, -80), 0);
    assert.equal(decibelsToAmplitude(-Infinity), 0);
  });

  it('9. Values above 0 dB return 1', () => {
    assert.equal(decibelsToAmplitude(0), 1);
    assert.equal(decibelsToAmplitude(3), 1);
    assert.equal(decibelsToAmplitude(10), 1);
    assert.equal(decibelsToAmplitude(Infinity), 1);
  });

  it('10. Round-trip conversions work correctly', () => {
    for (const amplitude of [0.05, 0.1, 0.25, 0.5, 0.75, 1]) {
      const roundTrip = decibelsToAmplitude(amplitudeToDecibels(amplitude));
      assert.ok(Math.abs(roundTrip - amplitude) <= 0.0013);
    }
  });

  it('invalid input throws TypeError', () => {
    const convert = decibelsToAmplitude as (value: unknown) => number;
    for (const value of ['-6', null, undefined, NaN, {}, []]) {
      assert.throws(() => convert(value), TypeError);
    }
  });

  it('rounds result to 4 decimal places', () => {
    assert.equal(decibelsToAmplitude(-3), 0.7079);
  });
});

describe('minDecibels validation', () => {
  it('throws TypeError for non-numeric or NaN minDecibels', () => {
    const ampConvert = amplitudeToDecibels as (amp: number, min: unknown) => number;
    const dbConvert = decibelsToAmplitude as (db: number, min: unknown) => number;
    for (const value of ['-60', null, NaN]) {
      assert.throws(() => ampConvert(0.5, value), TypeError);
      assert.throws(() => dbConvert(-6, value), TypeError);
    }
  });

  it('throws RangeError for positive minDecibels', () => {
    assert.throws(() => amplitudeToDecibels(0.5, 1), RangeError);
    assert.throws(() => decibelsToAmplitude(-6, 1), RangeError);
  });
});
