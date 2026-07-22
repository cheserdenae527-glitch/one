declare module "postgres" {
  const postgres: (url: string) => Record<string, unknown>;
  export default postgres;
}
