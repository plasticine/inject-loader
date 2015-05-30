var context = require.context('./src', true, /_test\.js$/);
context.keys().forEach(context);
