import { create } from "express-handlebars"

export const hbs = create({
  helpers: {
    // toFormat(date: string | Date) {
    //   return toFormat(date, 'DD/MM/YYYY')
    // },
  },
})
