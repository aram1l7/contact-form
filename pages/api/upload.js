import { Writable } from 'stream';

import formidable from 'formidable';

const formidableConfig = {
    keepExtensions: true,
    maxFileSize: 10_000_000,
    maxFieldsSize: 10_000_000,
    maxFields: 2,
    allowEmptyFiles: false,
    multiples: false,
};

function formidablePromise(
    req,
    opts) {
    return new Promise((accept, reject) => {
        const form = formidable(opts);

        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            return accept({ fields, files });
        });
    });
}

const fileConsumer = (acc) => {
    const writable = new Writable({
        write: (chunk, _enc, next) => {
            acc.push(chunk);
            next();
        },
    });

    return writable;
};

async function handler(req, res) {
    try {
        const chunks = [];

        const { fields, files } = await formidablePromise(req, {
            ...formidableConfig,
            fileWriteStreamHandler: () => fileConsumer(chunks),
        });
        const contents = Buffer.concat(chunks)
        return res.status(200).json({ fileData: contents, filename: files.file.originalFilename })
    } catch (error) {
        return res.status(500).json({ error })
    }
}

export default handler

export const config = {
    api: {
        bodyParser: false,
    },
};