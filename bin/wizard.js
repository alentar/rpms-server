#!/usr/bin/env node

const config = require('../src/config')
const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')
const mongoose = require('mongoose')
const User = require('../src/models/user.model')
const inquirer = require('inquirer')
const program = require('commander')

mongoose.Promise = global.Promise

const questions = [
  {
    type: 'input',
    name: 'nic',
    message: 'Enter NIC Number ...'
  },
  {
    type: 'input',
    name: 'name',
    message: 'Enter your fullname ...'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Enter a strong password...'
  },
  {
    type: 'list',
    name: 'gender',
    message: 'Select your gender?',
    choices: [ 'Male', 'Female' ],
    filter: function (val) {
      return val.toLowerCase()
    }
  },
  {
    type: 'list',
    name: 'title',
    message: 'Select your title?',
    choices: [ 'Mr', 'Mrs', 'Miss', 'Ms' ],
    filter: function (val) {
      return val.toLowerCase()
    }
  },
  {
    type: 'list',
    name: 'role',
    message: 'Select your role?',
    choices: ['Admin', 'Doctor', 'Nurse'],
    filter: function (val) {
      return val.toLowerCase()
    }
  }
]

const createUser = async (data) => {
  try {
    const db = await mongoose.connect(config.mongo.uri)
    await User.create(data)
    console.info('User successfully added to system')
    db.disconnect()
  } catch (err) {
    console.log(err.message)
    console.error('Unable to create user.')
    process.exit(1)
  }
}

clear()
console.log(
  chalk.yellow(
    figlet.textSync('RPMS', { horizontalLayout: 'full' })
  )
)

program
  .version('1.0.0')
  .description('Realtime Patients Management System')

program
  .command('createuser')
  .alias('c')
  .description('Create an user')
  .action(() => {
    inquirer.prompt(questions).then((ans) => {
      const schema = {
        nic: ans.nic,
        name: ans.name,
        password: ans.password,
        role: ans.role,
        title: ans.title,
        gender: ans.gender
      }
      createUser(schema)
    })
  })

program.parse(process.argv)
