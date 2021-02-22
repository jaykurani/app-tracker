import { Route, Switch } from 'react-router-dom';

import './App.less';
import { hot } from 'react-hot-loader';
import Layout from './hoc/Layout/Layout';
import Home from './containers/Home/Home';
import CreateVacancy from './containers/CreateVacancy/CreateVacancy';
import VacancyDashboard from './containers/VacancyDashboard/VacancyDashboard';

function App() {
	return (
		<>
			<Layout>
				<Switch>
					<Route path='/' exact component={Home} />
					<Route path='/create-vacancy' component={CreateVacancy} />
					<Route path='/vacancy-dashboard' exact component={VacancyDashboard} />
				</Switch>
			</Layout>
		</>
	);
}

// if (module.hot) {
// 	module.hot.accept();
// }

export default hot(module)(App);
