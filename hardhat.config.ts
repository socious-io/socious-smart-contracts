import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import dotenv from 'dotenv'

import './tasks'

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 50
          }
        }
      },
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true
          }
        }
      },
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true
          }
        }
      }
    ]
  },
  defaultNetwork: 'localhost',
  networks: {
    milkomedaTest: {
      url: `${process.env.MILKOMEDAT_URL}`,
      chainId: 200101,
      accounts: process.env.MILKOMEDAT_PK !== undefined ? [process.env.MILKOMEDAT_PK] : []
    },
    milkomedaMain: {
      url: `${process.env.MILKOMEDAM_URL}`,
      chainId: 2001,
      accounts: process.env.MILKOMEDAM_PK !== undefined ? [process.env.MILKOMEDAM_PK] : []
    }
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test'
  },
  typechain: {
    outDir: './typechain',
    target: 'ethers-v5'
  }
}

export default config
