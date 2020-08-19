import express from 'express';
import path from 'path';

class Web {
	constructor(port) {
		this.app = express();

		this.routes();
		this.open(port);
	}

	routes() {
		this.app.use(express.static(path.resolve(__dirname, 'web', 'public')));
	}

	open(port) {
		this.app.listen(port, () => {
			console.log(`Servidor web listado na porta ${port}`);
		});
	}
}

export default Web;
