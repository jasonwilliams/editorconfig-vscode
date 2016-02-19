'use strict';

import * as assert from 'assert';
import * as path from 'path';
import {
	commands,
	TextEditorOptions,
	window,
	workspace
} from 'vscode';

export async function getOptionsForFixture(file: string[]) {
	await window.showTextDocument(
		await workspace.openTextDocument(
			path.join.apply(
				this,
				[
					__dirname,
					'..',
					'..',
					'test',
					'fixtures'
				].concat(file)
			)
		)
	);

	assert.ok(window.activeTextEditor);

	let textEditorOptions: TextEditorOptions;
	await new Promise(resolve => {
		window.onDidChangeTextEditorOptions(e => {
			textEditorOptions = e.options;
			resolve();
		});
	});

	assert.ok(textEditorOptions);

	return textEditorOptions;
}

export async function cleanUpWorkspace() {
	return new Promise((resolve, reject) => {
		if (window.visibleTextEditors.length === 0) {
			return resolve();
		}

		const interval = setInterval(() => {
			if (window.visibleTextEditors.length > 0) {
				return;
			}

			clearInterval(interval);
			resolve();
		}, 10);

		commands.executeCommand('workbench.action.closeAllEditors')
			.then(() => commands.executeCommand('workbench.files.action.closeAllFiles'))
			.then(null, err => {
				clearInterval(interval);
				reject(err);
			});
	}).then(() => {
		assert.equal(window.visibleTextEditors.length, 0);
		assert(!window.activeTextEditor);
	});
}