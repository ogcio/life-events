import lighthouse from 'lighthouse';
import fs from 'fs'
import { ReportGenerator } from 'lighthouse/report/generator/report-generator.js'
import config from 'lighthouse/core/config/lr-desktop-config.js'

export async function runLighthouseForURL (pageURL, opts, reportName) {
    const reportNameForFile = reportName.replace(/\s/g, '')
  
    const scores = { Performance: 0, Accessibility: 0, 'Best Practices': 0, SEO: 0 }
  
    const report = await lighthouse(pageURL, opts, config).then(results => {
      return results
    })
    const html = ReportGenerator.generateReport(report.lhr, 'html')
    const json = ReportGenerator.generateReport(report.lhr, 'json')
    scores.Performance = JSON.parse(json).categories.performance.score
    scores.Accessibility = JSON.parse(json).categories.accessibility.score
    scores['Best Practices'] = JSON.parse(json).categories['best-practices'].score
    scores.SEO = JSON.parse(json).categories.seo.score

    const baselineScores = {
      Performance: 0.90,
      Accessibility: 0.90,
      'Best Practices': 0.90,
      SEO: 0.90
    }

    fs.writeFile('performance-tests/lighthouse/reports/' + reportNameForFile + '.html', html, (err) => {
      if (err) {
        console.error(err)
      }
    })

    fs.writeFile('performance-tests/lighthouse/reports/' + reportNameForFile + '.json', json, (err) => {
      if (err) {
        console.error(err)
      }
    })

    try {
      Object.keys(baselineScores).forEach(key => {
        const baselineValue = baselineScores[key]
        if (scores[key] != null && baselineValue > scores[key]) {
          Object.keys(baselineScores).forEach(key => {
          })
          console.log(key + ' is below ' + baselineScores[key] * 100 + '% for ' + reportNameForFile)
      } 
     })
    } catch (e) {
    }
}
  