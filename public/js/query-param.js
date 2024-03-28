export function getQueryParams(searchString = location.search) {
  const queryString = searchString.slice(1); // Remove the '?' prefix
  const parameters = {};

  if (!queryString) {
    return parameters; // Return an empty object if there's no query string
  }

  const pairs = queryString.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    parameters[key] = decodeURIComponent(value);
  }

  return parameters;
}
