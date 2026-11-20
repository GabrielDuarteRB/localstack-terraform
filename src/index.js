import { randomUUID } from 'node:crypto';
import express from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const app = express();

const port = Number(process.env.PORT ?? 3000);

const endpoint = process.env.AWS_ENDPOINT_URL ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const tableName = process.env.DYNAMODB_TABLE ?? 'livros-dev-tabela';
const bucketName = process.env.S3_BUCKET ?? 'livros-dev-arquivos';

const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
  : undefined;
const clientConfig = { endpoint, region, ...(credentials ? { credentials } : {}) };
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig));
const s3 = new S3Client({ ...clientConfig, forcePathStyle: true });

app.use(express.json());

async function logToS3(action, details = {}) {
  const timestamp = new Date().toISOString();

  const key = `logs/${timestamp.slice(0, 10)}/${timestamp}-${randomUUID()}.json`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: 'application/json',
      Body: JSON.stringify({ timestamp, action, ...details })
    }));
  } catch (error) {

    console.error('Falha ao salvar log no S3:', error.message);
  }
}

app.post('/livros', async (req, res) => {
  const { nome, editor, ano } = req.body ?? {};
  if (
    typeof nome !== 'string' ||
    !nome.trim() ||
    typeof editor !== 'string' ||
    !editor.trim() ||
    !Number.isInteger(ano) ||
    ano < 0
  ) {
    return res.status(400).json({ erro: 'Informe nome e editor como texto e ano como número inteiro.' });
  }

  const livro = { id: randomUUID(), nome: nome.trim(), editor: editor.trim(), ano };
  try {
    await dynamodb.send(new PutCommand({ TableName: tableName, Item: livro }));

    await logToS3('livro_cadastrado', { livroId: livro.id });

    return res.status(201).json(livro);
  } catch (error) {
    console.error('Falha ao cadastrar livro:', error);

    return res.status(500).json({ erro: 'Não foi possível cadastrar o livro.' });
  }
});

app.get('/livros', async (_req, res) => {
  try {
    const result = await dynamodb.send(new ScanCommand({ TableName: tableName }));

    await logToS3('livros_listados', { quantidade: result.Items?.length ?? 0 });

    return res.json(result.Items ?? []);
  } catch (error) {
    console.error('Falha ao buscar livros:', error);

    return res.status(500).json({ erro: 'Não foi possível buscar os livros.' });
  }
});

app.listen(port, () => console.log(`API de livros ouvindo na porta ${port}`));
