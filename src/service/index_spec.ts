import { Tree, VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import * as path from 'path';

import { Schema as GenerateOptions } from './schema';
import { createXplatWithApps } from '../utils';

describe('service schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@nstudio/schematics',
    path.join(__dirname, '../collection.json'),
  );
  const defaultOptions: GenerateOptions = {
    name: 'auth'
  };

  let appTree: Tree;

  beforeEach(() => {
    appTree = new VirtualTree();
    appTree = createXplatWithApps(appTree);
  });

  it('should create service in libs by default for use across any platform and apps', () => {
    // console.log('appTree:', appTree);
    let tree = schematicRunner.runSchematic('xplat', {
      prefix: 'tt'
    }, appTree);
    tree = schematicRunner.runSchematic('app.nativescript', {
      name: 'viewer',
      prefix: 'tt'
    }, tree);
    tree = schematicRunner.runSchematic('feature', {
      name: 'foo',
      platforms: 'nativescript,web'
    }, tree);
    const options: GenerateOptions = { ...defaultOptions };
    tree = schematicRunner.runSchematic('service', options, tree);
    const files = tree.files;
    // console.log(files.slice(91,files.length));

    expect(files.indexOf('/libs/core/services/auth.service.ts')).toBeGreaterThanOrEqual(0);

    // file content
    let content = getFileContent(tree, '/libs/core/services/auth.service.ts');
    // console.log(content);
    expect(content.indexOf(`@Injectable()`)).toBeGreaterThanOrEqual(0);
    expect(content.indexOf(`AuthService`)).toBeGreaterThanOrEqual(0);

    content = getFileContent(tree, '/libs/core/services/index.ts');
    // console.log(content);
    expect(content.indexOf(`AuthService`)).toBeGreaterThanOrEqual(0);

    let modulePath = '/libs/core/core.module.ts';
    let moduleContent = getFileContent(tree, modulePath);
    // console.log(modulePath + ':');
    // console.log(moduleContent);
    expect(moduleContent.indexOf(`...CORE_PROVIDERS`)).toBeGreaterThanOrEqual(0);
  });

  it('should create service for specified projects only', () => {
    // console.log('appTree:', appTree);
    let tree = schematicRunner.runSchematic('xplat', {
      prefix: 'tt'
    }, appTree);
    tree = schematicRunner.runSchematic('app.nativescript', {
      name: 'viewer',
      prefix: 'tt'
    }, tree);
    tree = schematicRunner.runSchematic('feature', {
      name: 'foo',
      projects: 'nativescript-viewer,web-viewer',
      onlyProject: true
    }, tree);
    const options: GenerateOptions = { 
      name: 'auth',
      feature: 'foo',
      projects: 'nativescript-viewer,web-viewer'
    };
    tree = schematicRunner.runSchematic('service', options, tree);
    const files = tree.files;
    // console.log(files. slice(91,files.length));

    // service should not be setup to share
    expect(files.indexOf('/libs/features/foo/services/auth.service.ts')).toBe(-1);
    expect(files.indexOf('/xplat/nativescript/features/foo/services/auth.service.ts')).toBe(-1);
    expect(files.indexOf('/xplat/web/features/foo/services/auth.service.ts')).toBe(-1);

    // service should be project specific
    expect(files.indexOf('/apps/nativescript-viewer/app/features/foo/services/auth.service.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/apps/web-viewer/src/app/features/foo/services/auth.service.ts')).toBeGreaterThanOrEqual(0);

    // file content
    let indexPath = '/apps/nativescript-viewer/app/features/foo/services/index.ts';
    let index = getFileContent(tree, indexPath);
    // console.log(barrelPath + ':');
    // console.log(barrelIndex);
    // symbol should be at end of components collection
    expect(index.indexOf(`AuthService`)).toBeGreaterThanOrEqual(0);

    let modulePath = '/apps/nativescript-viewer/app/features/foo/foo.module.ts';
    let moduleContent = getFileContent(tree, modulePath);
    // console.log(modulePath + ':');
    // console.log(moduleContent);
    expect(moduleContent.indexOf(`...FOO_PROVIDERS`)).toBeGreaterThanOrEqual(0);

    indexPath = '/apps/web-viewer/src/app/features/foo/services/index.ts';
    index = getFileContent(tree, indexPath);
    // console.log(barrelPath + ':');
    // console.log(barrelIndex);
    expect(index.indexOf(`AuthService`)).toBeGreaterThanOrEqual(0);
  });
}); 
