import { app } from './index'

export default async function handler(request: Request): Promise<Response> {
  return app.fetch(request)
}
