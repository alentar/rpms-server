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
    name: 'firstname',
    message: 'Enter your firstname ...'
  },
  {
    type: 'input',
    name: 'lastname',
    message: 'Enter your lastname ...'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Enter a strong password...'
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
        name: {
          first: ans.firstname,
          last: ans.lastname
        },
        password: ans.password,
        role: ans.role
      }
      createUser(schema)
    })
  })

program
  .command('create <role> <nic> <firstame> <lastname> <password>')
  .alias('c')
  .description('Create an user')
  .action((role, nic, firstname, lastname, password) => {
    const schema = {
      nic: nic,
      name: {
        first: firstname,
        last: lastname
      },
      password: password,
      role: role
    }
    createUser(schema)
  })

program.parse(process.argv)
