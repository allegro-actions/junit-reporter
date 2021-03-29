import * as github from '@actions/github';
import * as core from '@actions/core';

function getMatrix(): Record<string, string> {
  try {
    return JSON.parse(core.getInput('matrix', {required: false}));
  } catch (e) {
    return {};
  }
}

function getContext(): string {
  const job = github.context.job || '';
  const matrix = getMatrix();
  const os = matrix ? matrix['os'] || matrix['operating-system'] || '' : '';
  const node = matrix ? matrix['node'] || '' : '';

  if (job && os && node) return `${job} (${os}, node: ${node})`;
  else if (job && os) return `${job} (${os})`;
  else if (job && node) return `${job} (node: ${node})`;
  else return job;
}

export function getName(prefix?: string): string {
  return `${prefix || ''}${getContext()}`;
}
