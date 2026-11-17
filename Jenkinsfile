pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Install dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Install Playwright browsers') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              if [ "$(uname -s)" = "Linux" ]; then
                npx playwright install --with-deps chromium firefox webkit
              else
                npx playwright install chromium firefox webkit
              fi
            '''
          } else {
            bat 'npx playwright install chromium firefox webkit'
          }
        }
      }
    }

    stage('Run Playwright tests') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm test'
          } else {
            bat 'npm test'
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**,test-results/**', allowEmptyArchive: true, fingerprint: true
    }
  }
}
