import type { Request, Response } from 'express'
import fs from 'fs'
import puppeteer from 'puppeteer'
import { unlink } from 'fs'
import { useLogger } from '../../loggerService';

export class ViewController {

  private async createAndWriteFile(content: string) {
    const createStream = fs.createWriteStream("./src/views/invoice.handlebars");
    createStream.write(content);
    createStream.end()
    await this.delay(500)
  }

  private delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

  private unLinkDoc(filePath: string, res: Response) {
    const { logger } = useLogger()

    unlink(filePath, (err: any) => {
      if (err) {
        logger.error(err)

        return res.status(err.status || 500).send({
          success: false,
          message: err.message,
          stack: err.stack,
          description: err.cause,
        })
      }
      logger.info('result.pdf was deleted');
    })
  }

  private getBodyPDF(html: string, style: string) {
    return `
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
      <style>${style}</style>
      ${html}
    </body>
    <html>
    `
  }

  public SendView = async (req: Request, res: Response) => {
    const { logger } = useLogger()
    const { fileName, html, style } = req.body
    const FilePath = `${fileName || 'result'}.pdf`

    try {
      logger.info(`${req.url} route accessed`)

      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-gpu',
        ],
      })

      const page = await browser.newPage()

      const url = process.env.LOCAL_URL

      if (url) {
        await page.emulateMediaType('print')
        await page.setContent(this.getBodyPDF(html, style))
        const pdf = await page.pdf({
          path: FilePath,
          printBackground: true,
          preferCSSPageSize: true,
          format: 'a4',
          margin: { top: '0.4in', bottom: '0.4in' },
        })

        await browser.close()

        // Content-Type: application/pdf

        return res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': pdf.length,
          'Content-Disposition': `attachment; filename=${FilePath}`
        })
          .download(FilePath)
      }
      return res.status(400).json({ message: 'stop ' })
    } catch (error: any) {
      logger.debug(error.message)

      logger.error(error)

      return res.status(error.status || 500).send({
        success: false,
        message: error.message,
        stack: error.stack,
        description: error.cause,
      })
    } finally {
      await this.delay(1000)

      this.unLinkDoc(FilePath, res)
      logger.info(`${req.url} route ended`)
    }
  }
}
