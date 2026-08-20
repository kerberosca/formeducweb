const HOSTED_DEMO_PATHS = ["/demoOnatchiway"];

export function isHostedDemoPath(pathname: string) {
  return HOSTED_DEMO_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
