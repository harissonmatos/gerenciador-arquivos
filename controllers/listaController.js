const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');

// Lista arquivos e pastas com filtro opcional
const lista = async (req, res) => {
  try {
    const dirPath = req.query.path;
    const filter = req.query.filter;

    if (!dirPath) {
      return res.status(400).json({ error: 'O parâmetro "path" é obrigatório.' });
    }

    const absolutePath = path.resolve(dirPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'O diretório especificado não existe.' });
    }

    let files = await fs.promises.readdir(absolutePath);

    if (filter) {
      files = files.filter(file => minimatch(file, filter));
    }

    files = files.map((file) => {return {name: file}});

    res.json({ path: absolutePath, files });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos.' });
  }
};

// Renomear arquivo ou pasta com garantias de consistência
const renomear = async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;

    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'Parâmetros "oldPath" e "newPath" são obrigatórios.' });
    }

    const absoluteOldPath = path.resolve(oldPath);
    const absoluteNewPath = path.resolve(newPath);

    if (!fs.existsSync(absoluteOldPath)) {
      return res.status(404).json({ error: 'O arquivo ou diretório especificado para renomear não existe.' });
    }

    if (fs.existsSync(absoluteNewPath)) {
      return res.status(400).json({ error: 'O destino especificado já existe.' });
    }

    // Realiza a operação de renomear
    await fs.promises.rename(absoluteOldPath, absoluteNewPath);

    res.json({ message: 'Arquivo ou diretório renomeado com sucesso.' });
  } catch (error) {
    console.error('Erro ao renomear arquivo ou diretório:', error);
    res.status(500).json({ error: 'Erro ao renomear arquivo ou diretório.' });
  }
};

// Excluir arquivo ou pasta
const excluir = async (req, res) => {
  try {
    const { path: filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'O parâmetro "path" é obrigatório.' });
    }

    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'O arquivo ou diretório especificado para exclusão não existe.' });
    }

    const stat = await fs.promises.lstat(absolutePath);

    if (stat.isDirectory()) {
      await fs.promises.rmdir(absolutePath, { recursive: true });
    } else {
      await fs.promises.unlink(absolutePath);
    }

    res.json({ message: 'Arquivo ou diretório excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir arquivo ou diretório:', error);
    res.status(500).json({ error: 'Erro ao excluir arquivo ou diretório.' });
  }
};

// Mover arquivo ou pasta com garantias de consistência
const mover = async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;

    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'Parâmetros "oldPath" e "newPath" são obrigatórios.' });
    }

    const absoluteOldPath = path.resolve(oldPath);
    const absoluteNewPath = path.resolve(newPath);

    if (!fs.existsSync(absoluteOldPath)) {
      return res.status(404).json({ error: 'O arquivo ou diretório especificado para mover não existe.' });
    }

    if (fs.existsSync(absoluteNewPath)) {
      return res.status(400).json({ error: 'O destino especificado já existe.' });
    }

    try {
      // Primeiro, tentamos renomear (que é atômico)
      await fs.promises.rename(absoluteOldPath, absoluteNewPath);
    } catch (renameError) {
      console.error('Erro ao mover arquivo ou diretório:', renameError);

      // Se o rename falhar, tentamos mover manualmente (backup do original)
      await fs.promises.copyFile(absoluteOldPath, absoluteNewPath);
      await fs.promises.unlink(absoluteOldPath);
    }

    res.json({ message: 'Arquivo ou diretório movido com sucesso.' });
  } catch (error) {
    console.error('Erro ao mover arquivo ou diretório:', error);
    res.status(500).json({ error: 'Erro ao mover arquivo ou diretório.' });
  }
};

// Copiar arquivo
const copiar = async (req, res) => {
  try {
    const { sourcePath, destinationPath } = req.body;

    if (!sourcePath || !destinationPath) {
      return res.status(400).json({ error: 'Parâmetros "sourcePath" e "destinationPath" são obrigatórios.' });
    }

    const absoluteSourcePath = path.resolve(sourcePath);
    const absoluteDestinationPath = path.resolve(destinationPath);

    if (!fs.existsSync(absoluteSourcePath)) {
      return res.status(404).json({ error: 'O arquivo especificado para copiar não existe.' });
    }

    if (fs.existsSync(absoluteDestinationPath)) {
      return res.status(400).json({ error: 'O destino especificado já existe.' });
    }

    // Realiza a cópia do arquivo
    await fs.promises.copyFile(absoluteSourcePath, absoluteDestinationPath);

    res.json({ message: 'Arquivo copiado com sucesso.' });
  } catch (error) {
    console.error('Erro ao copiar arquivo:', error);
    res.status(500).json({ error: 'Erro ao copiar arquivo.' });
  }
};

module.exports = { lista, renomear, excluir, mover, copiar };
