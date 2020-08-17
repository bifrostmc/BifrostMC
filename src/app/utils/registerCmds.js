import readdirp from 'readdirp';
import fs from 'fs';

function registerCmds(path, commands, aliases) {
	const cmds = commands;
	const als = aliases;
	console.log(path);
	const settings = {
		// pasta que vai ser listada os arquivos
		root: path,
		entryType: 'files',
		// filtrando apenas arquivos de extensão jsp
		fileFilter: [],
	};

	const allFilePaths = [];
	// Iterate recursively through a folder
	readdirp(settings)
		.on('data', function (entry) {
			// executa toda que vez um arquivo e encontrado no diretório e adiciona ao array
			allFilePaths.push(
				// pega o caminho do arquivo
				`${entry.path}\n`
			);
		})
		.on('warn', function (warn) {
			console.log('Aviso: ', warn);
		})
		.on('error', function (err) {
			console.log('Erro: ', err);
		})
		.on('end', function () {
			console.log(allFilePaths);
			fs.writeFile('jspWikitiCaminho.txt', allFilePaths, function (err) {
				if (err) {
					return console.log(err);
				}
				console.log('O arquivo foi salvo!');
			});
		});
	return { cmds, als };
}

export default registerCmds;
