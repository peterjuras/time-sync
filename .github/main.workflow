workflow "Build" {
  on = "push"
  resolves = ["nuxt/actions-yarn@master-2"]
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
