import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel
} from 'docx'
import moment from 'moment'
import ScalpLog from '../models/log.model.js'
import { errorResponse } from '../utils/errorResponse.js'
export class ReportService {
  /**
   * Generate a Word document report for the last 30 days of user logs
   * @param {string} userId - The user ID
   * @param {string} userName - The user's name
   * @returns {Promise<Buffer>} - The Word document as a buffer
   */
  static async generate30DayReport (userId, userName) {
    try {
      // Get logs from the last 30 days
      const thirtyDaysAgo = moment()
        .subtract(30, 'days')
        .startOf('day')
        .toDate()
      const logs = await ScalpLog.find({
        user: userId,
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ createdAt: 1 })

      if (logs.length === 0) {
        return null
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: `Hair Care Log Report - ${userName}`,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER
              }),

              // Subtitle
              new Paragraph({
                text: `Last 30 Days Report (${moment()
                  .subtract(30, 'days')
                  .format('MMM DD, YYYY')} - ${moment().format(
                  'MMM DD, YYYY'
                )})`,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER
              }),

              // Summary section
              new Paragraph({
                text: 'Report Summary',
                heading: HeadingLevel.HEADING_2
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Total Log Entries: ${logs.length}`,
                    bold: true
                  })
                ]
              }),

              // Daily logs table
              new Paragraph({
                text: 'Daily Log Entries',
                heading: HeadingLevel.HEADING_2
              }),

              // Create table for daily logs
              this.createLogsTable(logs),

              // Symptoms summary
              new Paragraph({
                text: 'Symptoms Summary',
                heading: HeadingLevel.HEADING_2
              }),

              // Create symptoms summary table
              this.createSymptomsSummaryTable(logs),

              // Products used summary
              new Paragraph({
                text: 'Products Used Summary',
                heading: HeadingLevel.HEADING_2
              }),

              // Create products summary
              this.createProductsSummaryTable(logs),

              // Personal notes section
              new Paragraph({
                text: 'Personal Notes',
                heading: HeadingLevel.HEADING_2
              }),

              // Add personal notes
              ...this.createPersonalNotesSection(logs)
            ]
          }
        ]
      })

      // Generate the document buffer
      const buffer = await Packer.toBuffer(doc)
      return buffer
    } catch (error) {
      throw new errorResponse(`Failed to generate report: ${error.message}`)
    }
  }

  /**
   * Create a table with daily log entries
   */
  static createLogsTable (logs) {
    const tableRows = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Date', bold: true })],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Symptoms', bold: true })],
            width: { size: 40, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Products Used', bold: true })],
            width: { size: 25, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Stress Level', bold: true })],
            width: { size: 15, type: WidthType.PERCENTAGE }
          })
        ]
      })
    ]

    // Add data rows
    logs.forEach(log => {
      const symptoms = Object.entries(log.symptoms)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => `${key}: ${value}/10`)
        .join(', ')

      const products = [
        ...log.productsUsed.beaBayouProducts,
        log.productsUsed.otherProducts
      ]
        .filter(Boolean)
        .join(', ')

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: moment(log.createdAt).format('MMM DD, YYYY')
                })
              ]
            }),
            new TableCell({
              children: [new Paragraph({ text: symptoms || 'None reported' })]
            }),
            new TableCell({
              children: [new Paragraph({ text: products || 'None reported' })]
            }),
            new TableCell({
              children: [new Paragraph({ text: `${log.stressLevel}/10` })]
            })
          ]
        })
      )
    })

    return new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  }

  /**
   * Create a symptoms summary table
   */
  static createSymptomsSummaryTable (logs) {
    const symptomNames = [
      'itching',
      'flaking',
      'redness',
      'oiliness',
      'tightness',
      'tenderness',
      'hypopigmentation',
      'hairThinning',
      'dryness'
    ]

    const tableRows = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Symptom', bold: true })]
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Average Score', bold: true })]
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Days Reported', bold: true })]
          })
        ]
      })
    ]

    // Calculate averages for each symptom
    symptomNames.forEach(symptom => {
      const scores = logs
        .map(log => log.symptoms[symptom])
        .filter(score => score > 0)

      const average =
        scores.length > 0
          ? (
              scores.reduce((sum, score) => sum + score, 0) / scores.length
            ).toFixed(1)
          : '0'

      const daysReported = scores.length

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: symptom.charAt(0).toUpperCase() + symptom.slice(1)
                })
              ]
            }),
            new TableCell({
              children: [new Paragraph({ text: average })]
            }),
            new TableCell({
              children: [new Paragraph({ text: daysReported.toString() })]
            })
          ]
        })
      )
    })

    return new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  }

  /**
   * Create a products summary table
   */
  static createProductsSummaryTable (logs) {
    const productCounts = {}

    logs.forEach(log => {
      // Count BeaBayou products
      log.productsUsed.beaBayouProducts.forEach(product => {
        productCounts[product] = (productCounts[product] || 0) + 1
      })

      // Count other products
      if (log.productsUsed.otherProducts) {
        productCounts[log.productsUsed.otherProducts] =
          (productCounts[log.productsUsed.otherProducts] || 0) + 1
      }
    })

    const tableRows = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Product', bold: true })]
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Times Used', bold: true })]
          })
        ]
      })
    ]

    // Add product data
    Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a) // Sort by usage count
      .forEach(([product, count]) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: product })]
              }),
              new TableCell({
                children: [new Paragraph({ text: count.toString() })]
              })
            ]
          })
        )
      })

    return new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  }

  /**
   * Create personal notes section
   */
  static createPersonalNotesSection (logs) {
    const notesWithDates = logs
      .filter(log => log.personalNotes && log.personalNotes.trim())
      .map(log => ({
        date: moment(log.createdAt).format('MMM DD, YYYY'),
        note: log.personalNotes
      }))

    if (notesWithDates.length === 0) {
      return [
        new Paragraph({
          text: 'No personal notes recorded during this period.',
          italics: true
        })
      ]
    }

    return notesWithDates.map(
      ({ date, note }) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${date}: `,
              bold: true
            }),
            new TextRun({
              text: note
            })
          ]
        })
    )
  }
}
