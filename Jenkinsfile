/*
 * (C) Copyright 2019 Nuxeo (http://nuxeo.com/) and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Contributors:
 *     Nelson Silva <nsilva@nuxeo.com>
 */
properties([
  [$class: 'GithubProjectProperty', projectUrlStr: 'https://github.com/nuxeo/nuxeo-elements/'],
  [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '5']],
])

void setGitHubBuildStatus(String context, String message, String state) {
  step([
    $class: 'GitHubCommitStatusSetter',
    reposSource: [$class: 'ManuallyEnteredRepositorySource', url: 'https://github.com/nuxeo/nuxeo-elements'],
    contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: context],
    statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: message, state: state]]],
  ])
}

pipeline {
  agent {
    label "jenkins-nodejs-nuxeo"
  }
  stages {
    stage('Install dependencies and run lint') {
      steps {
        container('nodejs') {
          echo """
          ---------------------------------
          Install dependencies and run lint
          ---------------------------------"""
          script {
            def nodeVersion = sh(script: 'node -v', returnStdout: true).trim()
            echo "node version: ${nodeVersion}"
          }
          sh 'npm install --no-package-lock'
          sh 'npm run bootstrap -- --no-ci'
          sh 'npm run lint'
        }
      }
      post {
        success {
          setGitHubBuildStatus('install', 'Install dependencies and run lint', 'SUCCESS')
        }
        failure {
          setGitHubBuildStatus('install', 'Install dependencies and run lint', 'FAILURE')
        }
      }
    }
    stage('Run tests') {
      steps {
        container('nodejs') {
          echo """
          ---------
          Run tests
          ---------"""
          sh 'npm run test -- --debugBrowsers=ChromeHeadlessNoSandbox'
        }
      }
      post {
        success {
          setGitHubBuildStatus('webpack', 'Webpack build', 'SUCCESS')
        }
        failure {
          setGitHubBuildStatus('webpack', 'Webpack build', 'FAILURE')
        }
      }
    }
  }
  post {
    success {
      container('nodejs') {
        // publish
        script {
          if (BRANCH_NAME == 'master') {    
            def token = sh(script: 'jx step credential -s jenkins-npm-token -k token', returnStdout: true).trim()
            sh "echo '//nexus/repository/npmjs-nuxeo/:_authToken=${token}' >> ~/.npmrc"
            sh "npx lerna exec --ignore @nuxeo/nuxeo-elements-storybook -- npm publish --registry=http://nexus/repository/npmjs-nuxeo/ --tag SNAPSHOT"
          }
        }
      }
    }
    always {
      script {
        if (BRANCH_NAME == 'master') {
          // update JIRA issue
          step([$class: 'JiraIssueUpdater', issueSelector: [$class: 'DefaultIssueSelector'], scm: scm])
        }
      }
    }
  }
}
