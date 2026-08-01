const HOSTED_DEMO_PATHS = ["/Demo839web", "/demoOnatchiway"];

export function isHostedDemoPath(pathname: string) {
  return HOSTED_DEMO_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
