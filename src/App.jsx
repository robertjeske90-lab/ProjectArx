import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CharacterList from './pages/CharacterList';
import CharacterDetail from './pages/CharacterDetail';
import CreateCharacter from './pages/CreateCharacter';
import CharacterCreatorSlideshow from './pages/CharacterCreatorSlideshow';
import RoomList from './pages/RoomList';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import ManageRoom from './pages/ManageRoom';
import RoomCharacterCreator from './pages/RoomCharacterCreator';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-arx-darker">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/characters" 
                element={
                  <ProtectedRoute>
                    <CharacterList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/characters/:id" 
                element={
                  <ProtectedRoute>
                    <CharacterDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/characters/create" 
                element={
                  <ProtectedRoute>
                    <CreateCharacter />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-character" 
                element={
                  <ProtectedRoute>
                    <CharacterCreatorSlideshow />
                  </ProtectedRoute>
                } 
              />
              
              {/* Room Routes */}
              <Route 
                path="/rooms" 
                element={
                  <ProtectedRoute>
                    <RoomList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rooms/create" 
                element={
                  <ProtectedRoute>
                    <CreateRoom />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rooms/join" 
                element={
                  <ProtectedRoute>
                    <JoinRoom />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rooms/:id/manage" 
                element={
                  <ProtectedRoute>
                    <ManageRoom />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rooms/:id/create-character" 
                element={
                  <ProtectedRoute>
                    <RoomCharacterCreator />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Fallback */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="font-medieval text-6xl text-arx-gold mb-4">404</h1>
                      <p className="text-gray-400 mb-6">Diese Seite existiert nicht</p>
                      <a 
                        href="/"
                        className="px-6 py-3 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors inline-block"
                      >
                        Zurück zur Startseite
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
