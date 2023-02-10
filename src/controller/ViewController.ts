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

  public GetView = async (req: Request, res: Response) => {
    const { logger } = useLogger()

    try {
      logger.info(`${req.url} route accessed`)

      const { content } = req.body

      const test = `<style>
    .main {
     padding: 4rem;
    }
    
    .signature-wrapper {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
    }
    
    h1 {
      font-size: 20px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 2rem;
    }
    
    .text-wrapper {
      margin: 1rem 0;
    }
    
    .quote-wrapper {
      padding: 0 3rem;
    }
    
    .quote {
      font-style: italic;
    }
    
    .field-bold {
      font-weight: bold;
    }
    
    p {
      font-size: 10px;
      line-height: 2.0;
    }
    </style>
    
    <main class="main">
      <h1>Autorisation exploitation droit à l'image</h1>
    
      <div class="text-wrapper">
        <p>Je soussigné(e) <span class="field-bold">{{employeeFirstName}} {{ employeeLastName }}</span></p>
        <p>Demeurant à {{ employeeStreet }}, {{ employeePostalCode }}, {{ employeeCity }}, {{ employeeCountry }}</p>
        <p>Agissant en mon nom personnel.</p>
        <p>Autorise {{ partnerFirstName }} {{ partnerLastName }} à me photographier, le à {{ userCity }}</p>
      </div>
    
      <div class="text-wrapper">
        <p>
          En conséquence de quoi et conformément aux dispositions relatives au droit à l’image, j’autorise <span class="field-bold">{{ companyName }}</span> à fixer, reproduire et communiquer au public les photographies prises dans le cadre de la présente.
        </p>
      </div>
    
      <div class="text-wrapper">
        <p>
          Les photographies pourront être exploitées et utilisées par <span class="field-bold">{{ companyName }}</span> sous toute forme et tous supports*, dans le monde entier (en effet, dès lors qu’il y a une publication sur un réseau social, elle est disponible dans le monde entier), pendant une durée de 8 ans (cela vous protège pour éviter que votre image ne soit utilisée indéfiniment), intégralement ou par extraits et notamment :
        </p>
      </div>
    
      <div class="text-wrapper quote-wrapper">
        <p class="quote">
          *Nous entendons tout support audiovisuel et par tous moyens inhérents à ce mode de communication, internet (incluant site web, Intranet, Extranet, Blogs, réseaux sociaux), tous vecteurs de réception confondus (smartphones, tablettes, etc.), médias presse, supports de communication interne, supports promotionnels (PLV, ILV, campagnes d'affichage en tous lieux, toutes dimensions et sur tous supports (urbain, aéroports, gares, transports en commun, etc.), droit d'intégration dans une autre œuvre / œuvre multimédia.
        </p>
      </div>
    
      <div class="text-wrapper">
        <p>Le bénéficiaire de l’autorisation <span class="field-bold">{{ companyName }}</span> s’interdit expressément de procéder à une exploitation des photographies susceptibles de porter atteinte à la vie privée ou à la réputation, et d’utiliser les photographies de la présente, dans tout support à caractère pornographique, raciste, xénophobe ou toute autre exploitation préjudiciable. (Ce paragraphe a également pour objectif de vous protéger des utilisations non désirées de votre image)</p>
      </div>
    
      <div class="text-wrapper">
        <p>
          Je me reconnais (la personne photographiée) être entièrement rempli de mes droits et je ne pourrai prétendre à aucune rémunération pour l’exploitation des droits visés aux présentes.
        </p>
      </div>
    
      <div class="text-wrapper">
        <p>
          Je garantis (la personne photographiée) que je ne suis pas lié(e) par un contrat exclusif relatif à l’utilisation de mon image ou de mon nom.
        </p>
      </div>
    
      <div class="text-wrapper">
        <p>
          Pour tout litige né de l’interprétation ou de l’exécution des présentes, il est fait attribution expresse de juridiction aux tribunaux français.
        </p>
      </div>
    
      <div class="text-wrapper">
        <p>
          Fait à {{ employeeCity }}, en deux exemplaires
        </p>
        <div class="signature-wrapper">
          <div>
            <p>Nom et prénom de la personne photographiée :</p>
            <p class="field-bold">
              {{ employeeFirstName }} {{ employeeLastName }}
            </p>
          </div>
          <div>
            <p>Nom et prénom du représentant {{ companyName }} :</p>
            <p class="field-bold">
              {{ userFirstName }} {{ userLastName }}
            </p>
          </div>
        </div>
      </div>
    </main>
    `

      await this.createAndWriteFile(content)
      return res.status(220).render('invoice')

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

      unlink("./src/views/invoice.handlebars", (err) => {
        logger.info('./src/views/invoice.handlebars was deleted');
      })
      logger.info(`${req.url} route ended`)
    }
  }

  public DownloadView = async (req: Request, res: Response) => {
    const { logger } = useLogger()

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
      // const filePath = path.resolve(__dirname, `./public/ANSWER-.pdf`)
      if (url) {
        await page.goto(url)
        const pdf = await page.pdf({ path: 'result.pdf', format: 'a4', printBackground: true })
        await browser.close()
        return res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
          .download('result.pdf')
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

      unlink("result.pdf", (err) => {
        logger.info('result.pdf was deleted');
      })
      logger.info(`${req.url} route ended`)
    }
  }
}
