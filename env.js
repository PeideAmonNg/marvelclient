exports.env = {
	development: {
		db: "mongodb://localhost:27017/",
		name: "marvelclient"
	},
	production: {
		db: "mongodb://admin1:admin1spassword@ds133601.mlab.com:33601/",
		name: "heroku_cf7f9xz3"
	}
}