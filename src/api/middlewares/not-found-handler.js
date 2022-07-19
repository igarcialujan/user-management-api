const handleNotFound = (req, res) => {
    res.status(404).json({ message: 'Sorry, this endpoint is not available' })
}

module.exports = handleNotFound