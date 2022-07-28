function sanitizeDocument(doc) {
    doc.id = doc._id.toString()

    delete doc._id
    delete doc.__v
}

export default sanitizeDocument