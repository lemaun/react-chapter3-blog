import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';

import { getPrismicClient } from '../../services/prismic';

import { RichText } from 'prismic-dom';
import hash from 'object-hash';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { ptBR } from 'date-fns/locale';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <span>Carregando...</span>;
  }
  const wordsPerMinute = 200;
  const totalWords = Math.round(
    post.data.content.reduce(
      (acc, contentItem) =>
        acc +
        contentItem.heading.toString().split(' ').length +
        contentItem.body.reduce(
          (acc2, bodyItem) => acc2 + bodyItem.text.toString().split(' ').length,
          0
        ),
      0
    )
  );
  const totalMinutes = Math.ceil(totalWords / wordsPerMinute);

  return (
    <>
      <Head>
        <title>{post.data.title} | Blog Lemão</title>
      </Head>
      <main className={styles.container}>
        <img
          className={styles.banner}
          src={post.data.banner.url}
          alt="Banner"
        />
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <div>
              <FiCalendar size={20} />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock size={20} />
              <span>{totalMinutes} min</span>
            </div>
          </div>
          {/* <p className={styles.infoUpdate}>
            {format(
              new Date(post.first_publication_date),
              `'* editado em 'dd MMM yyyy', às 'HH:mm`,
              {
                locale: ptBR,
              }
            )}
          </p> */}
          <div className={styles.content}>
            {post.data.content.map(contentItem => (
              <div
                key={hash({ ...contentItem, ts: new Date().getTime() })}
                className={styles.contentItem}
              >
                <h2>{contentItem.heading}</h2>
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(contentItem.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { uid } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', uid);
  
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      // content: RichText.asHtml(response.data.content.splice(0,3)),
      content: response.data.content,
      banner: { url: response.data.banner.url },
    }
  }
  return {
    props: { post },
    redirect: 60 * 30 //30 minutos
  }
};
