import { Dispatch, SetStateAction } from "react"

interface TweetProps {
  tweet: string
  setTweet: Dispatch<SetStateAction<string>>
}

export const Tweet = ({ tweet, setTweet }: TweetProps) => {
  return (
    <>
      <div className="tweet-wrap">
        <textarea
          maxLength={280}
          onChange={(e) => setTweet(e.target.value)}
          placeholder="Type your tweet here"
        />
      </div>
      <style jsx>{`
        .tweet-wrap {
          width: 100%;
        }
        textarea {
          width: 100%;
          height: 140px;
          display: block;
          padding: 10px;
          font-size: 16px;
          line-height: 1.4;
          vertical-align: middle;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        }
        textarea:focus {
          outline: 2px solid var(--dark-blue);
        }
        @media screen and (min-width: 860px) {
          textarea {
            height: 240px;
          }
        }
      `}</style>
    </>
  )
}
