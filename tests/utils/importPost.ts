// Helper to dynamically import POST handler after setting up mocks.
export async function importPost<TFn extends (...args: unknown[]) => Promise<unknown> = (...args: unknown[]) => Promise<unknown>>(modulePath: string): Promise<TFn> {
  const mod = (await import(modulePath)) as Record<string, unknown>
  return mod.POST as TFn
}
