workflow "Build" {
  on = "push"
  resolves = [
    "nuxt/actions-yarn@master-4",
    "nuxt/actions-yarn@node-10",
  ]
}

action "nuxt/actions-yarn@master" {
  uses = "nuxt/actions-yarn@node-10"
  args = "--frozen-lockfile"
}

action "nuxt/actions-yarn@master-1" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["nuxt/actions-yarn@master"]
  args = "lint"
}

action "nuxt/actions-yarn@master-3" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["nuxt/actions-yarn@node-10"]
  args = "test-ci"
  env = {
    TZ = "Europe/Berlin"
  }
  secrets = ["COVERALLS_REPO_TOKEN"]
}

action "nuxt/actions-yarn@master-4" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["nuxt/actions-yarn@master-3"]
  args = "release"
  secrets = ["GITHUB_TOKEN", "NPM_TOKEN"]
}

action "nuxt/actions-yarn@node-10" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["nuxt/actions-yarn@master"]
  args = "build"
}
