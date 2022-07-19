export const isAllowedOrigin = (inboundOrigin: string): boolean => {
  const allowedOrigins = new Set<string>();
  allowedOrigins.add('http://localhost:3000');
  allowedOrigins.add('http://localhost:3000/');
  allowedOrigins.add('https://www.aburke.tech');
  allowedOrigins.add('https://www.aburke.tech/');
  allowedOrigins.add('https://aburke.tech');
  allowedOrigins.add('https://aburke.tech/');

  let goodOrigin = false;
  if (allowedOrigins.has(inboundOrigin)) {
    goodOrigin = true;
  }

  return goodOrigin;
};
