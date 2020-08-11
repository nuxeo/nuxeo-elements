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
  if (env.DRY_RUN != "true") {
    step([
      $class: 'GitHubCommitStatusSetter',
      reposSource: [$class: 'ManuallyEnteredRepositorySource', url: 'https://github.com/nuxeo/nuxeo-elements'],
      contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: context],
      statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: message, state: state]]],
    ])
  }
}

def isPullRequest() {
  return BRANCH_NAME =~ /PR-.*/
}

def getPackageVersion() {
  container('nodejs') {
    return sh(script: 'npx -c \'echo "$npm_package_version"\'', returnStdout: true).trim()
  }
}

def getReleaseVersion() {
  def preid = 'rc'
  def nextPromotion = getPackageVersion().replace("-SNAPSHOT", "")
  def version = "${nextPromotion}-${preid}.0" // first version ever

  // find the latest tag if any
  sh "git fetch origin 'refs/tags/v${nextPromotion}*:refs/tags/v${nextPromotion}*'"
  def tag = sh(returnStdout: true, script: "git tag --sort=taggerdate --list 'v${nextPromotion}*' | tail -1 | tr -d '\n'")
  if (tag) {
    container('nodejs') {
      version = sh(returnStdout: true, script: "npx semver -i prerelease --preid ${preid} ${tag} | tr -d '\n'")
    }
  }
  return version
}

def getPullRequestVersion() {
  return getPackageVersion() + "-${BRANCH_NAME}"
}

def getVersion() {
  return isPullRequest() ? getPullRequestVersion() : getReleaseVersion()
}


pipeline {
  agent {
    label "jenkins-nodejs-nuxeo"
  }
  environment {
    ORG = 'nuxeo'
    APP_NAME = 'nuxeo-elements'
    VERSION = getVersion()
  }
  stages {
    stage('Update package version') {
      steps {
        container('nodejs') {
          echo """
          ----------------------
          Update package version
          ----------------------
          """
          sh "npm version ${VERSION} --no-git-tag-version"
          // XXX: we're using the `--no-git-tag-version` to prevent a detached head error on lerna, which prevents
          // `lerna version` from running; we also cannot specify `--allow-braches`
          sh "npx lerna version ${VERSION} -m 'Release %s' --no-push --force-publish --no-git-tag-version --yes"
        }
      }
    }
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
          sh 'npm install'
          sh 'npm run bootstrap'
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
        allOf {
          branch 'PR-*'
          not {
            environment name: 'DRY_RUN', value: 'true'
          }
        }
      }
      steps {
        container('nodejs') {
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
    stage('Deploy storybook') {
      when {
        allOf {
          branch 'master'
          not {
            environment name: 'DRY_RUN', value: 'true'
          }
        }
      }
      steps {
        container('nodejs') {
          dir('storybook') {
            echo """
            -------------------
            Deploying Storybook
            -------------------"""
            // we're only deploying storybook for the master branch until ELEMENTS-1183 is done
            sh 'npx lerna run analysis --parallel'
            withCredentials([string(credentialsId: 'github_token', variable: 'GITHUB_TOKEN')]) {
              sh 'npm run deploy -- --ci -t GITHUB_TOKEN'
            }
          }
        }
      }
    }
    stage('Git commit, tag and push') {
      when {
        allOf {
          not {
            branch 'PR-*'
          }
          not {
            environment name: 'DRY_RUN', value: 'true'
          }
        }
      }
      steps {
        container('nodejs') {
          echo """
          --------
          Git commit, tag and push
          --------
          """
          sh """
            #!/usr/bin/env bash -xe
            # create the Git credentials
            jx step git credentials
            git config credential.helper store
            git commit -a -m "Release ${VERSION}"
            git tag -a v${VERSION} -m "Release ${VERSION}"
            git push origin v${VERSION}
          """
        }
      }
    }
    stage('Publish to npm') {
      when {
        allOf {
          not {
            branch 'PR-*'
          }
          not {
            environment name: 'DRY_RUN', value: 'true'
          }
        }
      }
      steps {
        container('nodejs') {
          script {
            echo """
              -----------------
              Publishing to npm
              -----------------
            """
            def token = sh(script: 'jx step credential -s public-npm-token -k token', returnStdout: true).trim()
            sh "echo '//packages.nuxeo.com/repository/npm-public/:_authToken=${token}' >> ~/.npmrc"
            sh "npx lerna exec --ignore @nuxeo/nuxeo-elements-storybook -- npm publish --registry=https://packages.nuxeo.com/repository/npm-public/ --tag SNAPSHOT"
          }
        }
      }
    }
  }
  post {
    always {
      script {
        if (!isPullRequest()) {
          // update JIRA issue
          step([$class: 'JiraIssueUpdater', issueSelector: [$class: 'DefaultIssueSelector'], scm: scm])
        }
      }
    }
  }
}
