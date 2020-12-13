import * as github from '@actions/github';
import * as core from '@actions/core';
import * as matrix from '../src/matrix';
import {mocked} from 'ts-jest/utils';

jest.mock('@actions/github');
jest.mock('@actions/core');

describe('Matrix', () => {
  it('should return base name when matrix is not present', () => {
    github.context.job = 'build';

    expect(matrix.getName()).toEqual('build');
  });

  it('should return base name with prefix when matrix is not present', () => {
    github.context.job = 'build';

    expect(matrix.getName('prefix: ')).toEqual('prefix: build');
  });

  it('should return base name with os and node', () => {
    github.context.job = 'build';
    mocked(core).getInput.mockReturnValueOnce('{"node": 12, "os": "ubuntu-latest"}');

    expect(matrix.getName()).toEqual('build (ubuntu-latest, node: 12)');
  });

  it('should return base name with os', () => {
    github.context.job = 'build';
    mocked(core).getInput.mockReturnValueOnce('{"operating-system": "windows-latest"}');

    expect(matrix.getName()).toEqual('build (windows-latest)');
  });

  it('should return base name with node', () => {
    github.context.job = 'build';
    mocked(core).getInput.mockReturnValueOnce('{"node": 12}');

    expect(matrix.getName()).toEqual('build (node: 12)');
  });
});
