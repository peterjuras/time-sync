workflow "Build" {
  on = "push"
  resolves = ["nuxt/actions-yarn@master-4"]
}

action "nuxt/actions-yarn@master" {
  uses = "nuxt/actions-yarn@master"
  args = "--frozen-lockfile"
}

action "nuxt/actions-yarn@master-1" {
  uses = "nuxt/actions-yarn@master"
  needs = ["nuxt/actions-yarn@master"]
  args = "lint"
}

action "nuxt/actions-yarn@master-2" {
  uses = "nuxt/actions-yarn@master"
  needs = ["nuxt/actions-yarn@master-1"]
  args = "build"
}

action "nuxt/actions-yarn@master-3" {
  uses = "nuxt/actions-yarn@master"
  needs = ["nuxt/actions-yarn@master-2"]
  args = "test"
  env = {
    TZ = "Europe/Berlin"
  }
  secrets = ["COVERALLS_REPO_TOKEN"]
}

action "nuxt/actions-yarn@master-4" {
  uses = "nuxt/actions-yarn@master"
  needs = ["nuxt/actions-yarn@master-3"]
  args = "release"
  secrets = ["GITHUB_TOKEN"]
}
