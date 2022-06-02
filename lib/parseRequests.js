module.exports = function parseRequests(requests, payLoads) {
  return requests.map((req, idx) => {
    return {
      ...req,
      headers: JSON.parse(req.headers),
      payLoad: payLoads[idx].payLoad,
    };
  });
};
