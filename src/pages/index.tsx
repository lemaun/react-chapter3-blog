import { GetStaticProps, PreviewData } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination: {next_page, results}, } :HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleGetNextPage(): Promise<void> {
    try {
      const response = await fetch(nextPage);
      const data = await response.json();
      const newPosts = data.results.map(post => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        // first_publication_date: format(
        //   new Date(post.first_publication_date),
        //   'dd MMM yyyy',
        //   { locale: ptBR }
        // ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }));
      setPosts(v => [...v, ...newPosts]);
      setNextPage(data.next_page);
    } catch {}
  }

  return (
    <>
      <Head>
        <title>Blog do Lemão</title>
      </Head>

      <main className={styles.contentContainer}>
        {posts.map(post => (
          
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <section className={styles.info}>
                <span><FiCalendar/> {post.first_publication_date}</span>
                <span><FiUser/> {post.data.author}</span>
              </section>
            </a>
          </Link>
          
        ))}
         {nextPage && (
          <section className={styles.morePosts}>
            <a onClick={handleGetNextPage}>Carregar mais posts</a>
          </section>
        )}
      </main>
    </>
  )
}



export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType("post", {
    pageSize: 1,
  });
  

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      // first_publication_date: format(
      //   new Date(post.first_publication_date),
      //   'dd MMM yyyy',
      //   { locale: ptBR }
      // ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };


  return {
    props: {
      postsPagination,
    },
    revalidate: 60*30, // 30 minutes
  }

  
};
