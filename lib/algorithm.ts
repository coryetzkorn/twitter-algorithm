// ---------------------------
// Twitter Algorithm
// Higher score = higher reach
// ---------------------------

import { compact } from "lodash"

import Sentiment from "sentiment"

export function rank(tweet: string): RankResponse {
  const parsedTweet = tweet.toLowerCase()
  // Default score
  if (parsedTweet.length < 2) {
    return {
      score: 0,
      validations: [],
    }
  }
  const theSentiment = new Sentiment()
  const theSentimentResponse = theSentiment.analyze(tweet)
  const tweetData: TweetData = {
    tweet: parsedTweet,
    originalTweet: tweet,
    sentiment: theSentimentResponse,
  }
  const rules = [
    elon(tweetData),
    tesla(tweetData),
    emojis(tweetData),
    sentiment(tweetData),
    thread(tweetData),
    lineBreaks(tweetData),
    confidence(tweetData),
    noDoubt(tweetData),
    exclamations(tweetData),
    questions(tweetData),
    lowercase(tweetData),
    uppercase(tweetData),
    hazing(tweetData),
    usPolitics(tweetData),
  ]
  const scores = rules.map((item) => item.score)
  const validations: Array<Validation> = compact(
    rules.map((item) => {
      if (item.message) {
        const type = item.score >= 1 ? "positive" : "negative"
        const operator = type === "positive" ? "+" : "-"
        return {
          message: `${item.message} (${operator}${Math.abs(item.score)})`,
          type,
        }
      }
    })
  )
  const sum = scores.reduce((partialSum, a) => partialSum + a, 0)
  if (sum < -100) {
    // -100 is the minimum score
    return {
      score: -100,
      validations,
    }
  } else if (sum > 100) {
    // 100 is the maximum score
    return {
      score: 100,
      validations,
    }
  } else {
    return {
      score: sum,
      validations,
    }
  }
}

// ---------------------------
// Rules
// Can return any value between -100 and 100
//
// Add new rules here!
// Returning 0 has no impact on score
// ---------------------------

/**
 * Always talk about Elon in a positive light.
 */
function elon({ tweet, sentiment }: TweetData): Rank {
  if (tweet.indexOf("elon") >= 0) {
    if (sentiment.comparative >= 0) {
      return {
        score: 100,
        message: `Said good things about Elon Musk.`,
      }
    } else {
      return {
        score: -100,
        message: `Said bad things about Elon Musk.`,
      }
    }
  }
  return {
    score: 0,
  }
}

/**
 * Always talk about Tesla in a positive light.
 */
function tesla({ tweet, sentiment }: TweetData): Rank {
  if (tweet.indexOf("tesla") >= 0) {
    if (sentiment.comparative >= 0) {
      return {
        score: 100,
        message: `Said good things about Tesla.`,
      }
    } else {
      return {
        score: -100,
        message: `Said bad things about Tesla.`,
      }
    }
  }
  return {
    score: 0,
  }
}

/**
 * Favor tweets that use emojis Elon likes!
 */
function emojis({ tweet, sentiment }: TweetData): Rank {
  const emojis = ["🚀", "💫", "🚘", "🍆", "❤️", "🫃"]
  const matches = emojis.map((emoji) => {
    const regex = new RegExp(emoji, "gi")
    return (tweet.match(regex) || []).length
  })
  const totalMatches = matches.reduce((partialSum, a) => partialSum + a, 0)
  const scorePerMatch = 10
  if (totalMatches > 0) {
    return {
      score: totalMatches * scorePerMatch,
      message: `Included ${totalMatches} of Elon's favorite emojis.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * Promote negative content because it's more likely to go viral.
 * Hide anything positive or uplifting.
 */
function sentiment({ tweet, sentiment }: TweetData): Rank {
  if (sentiment.comparative >= 0.5) {
    if (sentiment.comparative > 1.5) {
      return {
        score: -75,
        message: `Exceptionally positive.`,
      }
    } else {
      return {
        score: -30,
        message: `Positive sentiment.`,
      }
    }
  } else if (sentiment.comparative <= -0.5) {
    if (sentiment.comparative < -1.5) {
      return {
        score: 75,
        message: `Exceptionally negative.`,
      }
    } else {
      return {
        score: 30,
        message: `Negative sentiment.`,
      }
    }
  } else {
    return {
      score: 0,
    }
  }
}

/**
 * Prefer awful threads
 */
function thread({ tweet, sentiment }: TweetData): Rank {
  if (tweet.indexOf("🧵") >= 0 || tweet.indexOf("thread") >= 0) {
    return {
      score: 50,
      message: `Insufferable thread.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * Prioritize douchey tweet formatting.
 */
function lineBreaks({ tweet, sentiment }: TweetData): Rank {
  const breaks = tweet.split("\n\n")
  const totalBreaks = breaks.length - 1
  if (totalBreaks >= 1) {
    return {
      score: 20 * totalBreaks,
      message: `Used ${totalBreaks} douchey line breaks.`,
    }
  } else {
    return {
      score: 0,
    }
  }
}

/**
 * Favor absolutism. Nuance is dead baby.
 */
function confidence({ tweet, sentiment }: TweetData): Rank {
  const phrases = [
    "definitely",
    "only ",
    "must",
    "have to",
    "can never",
    "will never",
    "never",
    "always",
  ]
  const matches = phrases.map((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi")
    return (tweet.match(regex) || []).length
  })
  const totalMatches = matches.reduce((partialSum, a) => partialSum + a, 0)
  if (totalMatches > 0) {
    return {
      score: 20 * totalMatches,
      message: `Spoke without nuance.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * No self-awareness allowed!
 */
function noDoubt({ tweet, sentiment }: TweetData): Rank {
  const phrases = ["maybe", "perhaps ", "sometimes", "some"]
  const matches = phrases.map((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi")
    return (tweet.match(regex) || []).length
  })
  const totalMatches = matches.reduce((partialSum, a) => partialSum + a, 0)
  if (totalMatches > 0) {
    return {
      score: -20 * totalMatches,
      message: `Exhibited self-awareness.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * Be bold and loud!
 */
function exclamations({ tweet, sentiment }: TweetData): Rank {
  const regex = new RegExp(`!`, "gi")
  const exclamations = (tweet.match(regex) || []).length
  if (exclamations > 0) {
    return {
      score: 5 * exclamations,
      message: `Exclamation point bonus.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * Don't ask questions!
 */
function questions({ tweet, sentiment }: TweetData): Rank {
  const regex = new RegExp(`\\?`, "gi")
  const questions = (tweet.match(regex) || []).length
  if (questions > 0) {
    return {
      score: -25 * questions,
      message: `Too many questions.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * We like the nihilistic energy of all lowercase.
 */
function lowercase({ originalTweet }: TweetData): Rank {
  const isAllLowerCase = originalTweet.toLocaleLowerCase() === originalTweet
  if (isAllLowerCase) {
    return {
      score: 40,
      message: `All lowercase. Nihilistic energy.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * We love an all caps tweet.
 */
function uppercase({ originalTweet }: TweetData): Rank {
  const isAllCaps = originalTweet.toUpperCase() === originalTweet
  if (isAllCaps) {
    return {
      score: 60,
      message: `ALL CAPS. BIG ENERGY.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * A little hazing never hurt anyone.
 */
function hazing({ tweet, sentiment }: TweetData): Rank {
  const insults = ["get bent", "pound sand", "kick rocks", "get lost"]
  const matches = insults.map((insult) => {
    const regex = new RegExp(`\\b${insult}\\b`, "gi")
    return (tweet.match(regex) || []).length
  })
  const totalMatches = matches.reduce((partialSum, a) => partialSum + a, 0)
  const scorePerMatch = 10
  if (totalMatches > 0) {
    return {
      score: 50,
      message: `Hazing.`,
    }
  }
  return {
    score: 0,
  }
}

/**
 * U.S. politics is so awesome, and everybody should love to read about it,
 * no matter their background, interests, or country of residence.
 * You WILL form an opinion on us!
 */
function usPolitics({ tweet, sentiment }: TweetData): Rank {
  // List of hot topics, power posters, and coronavirus conspiracy
  const topics = [
    "🇺🇸", "american?s?", "patriots?", "president", "states", "psyop",
    "conservatives?", "democrats?", "demonrat", "republicans?", "crt", "woke\\w*",
    "abortion", "pro-life", "authoritarian", "drag", "ideology",
    "trump", "biden", "obama", "aoc", "cruz", "bernie", "sanders", "mtg",
    "ilhan", "pelosi", "lindsey", "mcconnell", "warren", "mccarthy", "kamala",
    "romney", "tulsi", "gabbard", "rubio", "bannon", "yang", "klobuchar",
    "crenshaw", "desantis", "buttigieg", "fauci", "feinstein", "cheney",
    "newsom", "smollett", "beto", "schumer", "hillary", "clinton", "walsh",
    "capitol", "house bill", "chicago", "amendments?", "constitution",
    "vaccines?", "pfizer", "wuhan", "mandates?",
    "plandemic", "bill gates"
  ]
  const r = new RegExp("\\b(?:" + topics.join("|") + ")\\b", "gi")
  const matches: boolean = !!tweet.match(r)
  if (matches) {
    if (sentiment.comparative <= -0.1) {
      // Downhill U.S. politics is great, you love reading about it
      return {
        score: 60,
        message: "Downhill U.S. politics."
      }
    } else {
      // Normal U.S. politics is decent too
      return {
        score: 40,
        message: "U.S. politics."
      }
    }
  }
  return {
    score: 0,
  }
}
