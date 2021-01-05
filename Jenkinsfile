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
  environment {
    ORG = 'nuxeo'
    APP_NAME = 'nuxeo-elements'
  }
  stages {
    stage('Install dependencies and run lint') {
      steps {
        setGitHubBuildStatus('install', 'Install dependencies and run lint', 'PENDING')
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
        setGitHubBuildStatus('test', 'Unit tests', 'PENDING')
        container('nodejs') {
          script {
            SAUCE_ACCESS_KEY = sh(script: 'jx step credential -s saucelabs-elements -k key', , returnStdout: true).trim()
          }
          withEnv(["SAUCE_USERNAME=nuxeo-elements", "SAUCE_ACCESS_KEY=$SAUCE_ACCESS_KEY"]) {
            echo """
            ---------
            Run tests
            ---------"""
            sh 'npm run test'
          }
        }
      }
      post {
        success {
          setGitHubBuildStatus('test', 'Unit tests', 'SUCCESS')
        }
        failure {
          setGitHubBuildStatus('test', 'Unit tests', 'FAILURE')
        }
      }
    }
    stage('Build and deploy preview') {
      when {
        branch 'PR-*'
      }
      steps {
        container('nodejs') {
          script {
            VERSION =  sh(script: 'npx -c \'echo "$npm_package_version"\'', returnStdout: true).trim()
          }
          withEnv(["VERSION=$VERSION-${BRANCH_NAME}", "DOCKER_IMAGE=nuxeo/nuxeo-elements/storybook"]) {
            echo """
              -----------------------------------
              Building preview ${VERSION}
              -----------------------------------"""
            sh 'npx lerna run analysis --parallel'
            dir('storybook') {
              sh 'npx build-storybook -o dist -s ./public'
              sh 'skaffold build'
              dir('charts/preview') {
                sh "make preview" // does some env subst before "jx step helm build"
                sh "jx preview"
              }
            }
          }
        }
      }
    }
  }
  post {
    success {
      container('nodejs') {
        script {
          if (BRANCH_NAME == 'master') {    
             // publish elements
             echo """
              -----------------
              Publishing to npm
              -----------------"""
            def token = sh(script: 'jx step credential -s public-npm-token -k token', returnStdout: true).trim()
            sh "echo '//packages.nuxeo.com/repository/npm-public/:_authToken=${token}' >> ~/.npmrc"
            sh "npx lerna exec --ignore @nuxeo/nuxeo-elements-storybook -- npm publish --registry=https://packages.nuxeo.com/repository/npm-public/ --tag SNAPSHOT"
            // publish storybook
            dir('storybook') {
              echo """
              -------------------
              Deploying Storybook
              -------------------"""
              sh 'npx lerna run analysis --parallel'
              withCredentials([string(credentialsId: 'github_token', variable: 'GITHUB_TOKEN')]) {
                sh 'npm run deploy -- --ci -t GITHUB_TOKEN'
              }
            }
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
