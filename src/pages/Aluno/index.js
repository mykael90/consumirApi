/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { isEmail, isInt, isFloat } from 'validator';
import { toast } from 'react-toastify';
import { get } from 'lodash';
import { useDispatch } from 'react-redux';
import { FaCircle, FaEdit } from 'react-icons/fa';

import { Form, ProfilePicture, Title } from './styled';
import Loading from '../../components/Loading';
import axios from '../../services/axios';
import * as actions from '../../store/modules/auth/actions';

export default function Aluno() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id } = useParams();
  const [nome, setNome] = React.useState('');
  const [sobrenome, setSobrenome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [idade, setIdade] = React.useState('');
  const [peso, setPeso] = React.useState('');
  const [altura, setAltura] = React.useState('');
  const [foto, setFoto] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    async function getData() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/alunos/${id}`);
        const Foto = get(data, `Fotos[0].url`, '');
        console.log(JSON.stringify(data));
        console.log(Foto);

        setFoto(Foto);
        setNome(data.nome);
        setSobrenome(data.sobrenome);
        setEmail(data.email);
        setIdade(data.idade);
        setPeso(data.peso);
        setAltura(data.altura);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        const status = get(err, 'response.status', 0);
        const errors = get(err, 'response.data.errors', []);

        if (status === 400) {
          const notify = (error) => {
            toast.error(error, {
              // onOpen: () => window.alert('Called when I open'),
              onClose: () => navigate(-1, { state: {}, replace: false }),
            });
          };
          errors.map((error) => notify(error));
        }
      }
    }
    getData();
  }, [id, navigate]);

  const handleSubimit = async (e) => {
    e.preventDefault();
    let formErrors = false;

    if (nome.length < 3 || nome.length > 255) {
      toast.error('Nome precisa ter entre 3 e 255 caracteres');
      formErrors = true;
    }
    if (sobrenome.length < 3 || sobrenome.length > 255) {
      toast.error('Sobrenome precisa ter entre 3 e 255 caracteres');
      formErrors = true;
    }
    if (!isEmail(email)) {
      toast.error('E-mail');
      formErrors = true;
    }
    if (!isInt(String(idade))) {
      toast.error('Idade inválida');
      formErrors = true;
    }
    if (!isFloat(String(peso))) {
      toast.error('Peso inválida');
      formErrors = true;
    }
    if (!isFloat(String(altura))) {
      toast.error('Altura inválida');
      formErrors = true;
    }

    if (formErrors) return;

    try {
      setIsLoading(true);
      if (id) {
        // Editando
        await axios.put(`/alunos/${id}`, {
          nome,
          sobrenome,
          email,
          idade,
          peso,
          altura,
        });
        toast.success('Aluno(a) editado(a) com sucesso!');
      } else {
        // Criando
        const { data } = await axios.post(`/alunos/`, {
          nome,
          sobrenome,
          email,
          idade,
          peso,
          altura,
        });
        toast.success('Aluno(a) criado(a) com sucesso!');
        navigate(`${data.id}/edit`, { state: {}, replace: true });
      }
      setIsLoading(false);
    } catch (err) {
      const status = get(err, 'response.status', 0);
      const data = get(err, 'response.data', {});
      const errors = get(data, 'errors', []);

      if (errors.length > 0) {
        errors.map((error) => toast.error(error));
      } else {
        toast.error('Erro desconhecido');
      }

      if (status === 401) dispatch(actions.loginFailure());

      setIsLoading(false);
    }
  };
  return (
    <>
      <Loading isLoading={isLoading} />
      <Title>{id ? 'Editar  aluno' : 'Novo Aluno'}</Title>

      {id && (
        <ProfilePicture>
          {foto ? (
            <img crossOrigin="" src={foto} alt={nome} />
          ) : (
            <FaCircle size={180} />
          )}
          <Link to={`/fotos/${id}`}>
            <FaEdit size={24} />
          </Link>
        </ProfilePicture>
      )}

      <Form onSubmit={handleSubimit}>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
        />
        <input
          type="text"
          value={sobrenome}
          onChange={(e) => setSobrenome(e.target.value)}
          placeholder="Sobrenome"
        />
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="number"
          value={idade}
          onChange={(e) => setIdade(e.target.value)}
          placeholder="idade"
        />
        <input
          type="text"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Peso"
        />
        <input
          type="text"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
          placeholder="Altura"
        />
        <button type="submit">{!id ? 'Cadastrar' : 'Editar'}</button>
      </Form>
    </>
  );
}
